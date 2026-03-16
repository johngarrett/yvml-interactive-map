import { LocalStorageProvider } from "../storage";
import type { POI } from "../types";
import { debug, info } from "../utils";

const getTimestampKey = (entry: POI) => {
    return `${entry.id}-timestamp`;
};

type AudioEventName =
    | "ended"
    | "loadedmetadata"
    | "pause"
    | "play"
    | "timeupdate";

type AudioElementController = {
    configure: (entry: POI) => void;
    play: () => Promise<void>;
    pause: () => void;
    togglePlayPause: () => Promise<void>;
    seekBySeconds: (seconds: number) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    isPaused: () => boolean;
    saveCurrentTime: () => void;
    on: (eventName: AudioEventName, listener: EventListener) => () => void;
    teardown: () => void;
};

export const AudioElement = {
    create({ element }: { element: HTMLAudioElement }): AudioElementController {
        let activeEntry: POI | undefined;

        const saveCurrentTime = () => {
            if (!activeEntry) {
                return;
            }

            LocalStorageProvider.set(
                getTimestampKey(activeEntry),
                JSON.stringify(element.currentTime),
            );
        };

        const configure = (entry: POI) => {
            if (activeEntry?.id !== entry.id) {
                saveCurrentTime();
            }

            activeEntry = entry;
            element.pause();

            const timestampKey = getTimestampKey(entry);
            const savedTime = LocalStorageProvider.has(timestampKey)
                ? Number(
                      JSON.parse(
                          LocalStorageProvider.getOrThrow(timestampKey),
                      ),
                  )
                : 0;

            if (!LocalStorageProvider.has(timestampKey)) {
                debug("AudioElement: no timestampKey found, will start at 0");
            }

            element.src = `${import.meta.env.BASE_URL}audio/${entry.audioName}`;
            element.load();

            const applyResumePosition = () => {
                element.currentTime = savedTime;
                element.removeEventListener(
                    "loadedmetadata",
                    applyResumePosition,
                );
            };

            element.addEventListener("loadedmetadata", applyResumePosition);
        };

        const teardown = () => {
            if (!activeEntry) {
                return;
            }

            info(`AudioElement: teardown on ${activeEntry.title}`);

            if (!element.paused) {
                debug("AudioElement: audio wasn't paused, calling pause");
                element.pause();
            }

            saveCurrentTime();
            element.removeAttribute("src");
            element.load();
            activeEntry = undefined;
        };

        return {
            configure,
            async play() {
                await element.play();
            },
            pause() {
                element.pause();
            },
            async togglePlayPause() {
                if (element.paused) {
                    await element.play();
                    return;
                }

                element.pause();
            },
            seekBySeconds(seconds: number) {
                if (!Number.isFinite(element.duration)) {
                    if (seconds < 0) {
                        element.currentTime = Math.max(
                            element.currentTime + seconds,
                            0,
                        );
                    }
                    return;
                }

                element.currentTime = Math.min(
                    Math.max(element.currentTime + seconds, 0),
                    element.duration,
                );
            },
            getCurrentTime() {
                return element.currentTime;
            },
            getDuration() {
                return element.duration;
            },
            isPaused() {
                return element.paused;
            },
            saveCurrentTime,
            on(eventName, listener) {
                element.addEventListener(eventName, listener);

                return () => {
                    element.removeEventListener(eventName, listener);
                };
            },
            teardown,
        };
    },
};
