import { poiTrackerInstance } from "../points";
import { LocalStorageProvider } from "../storage";
import type { POI } from "../types";
import { getElementOrThrow, info } from "../utils";

const getPlaybackKey = (entry: POI) => {
    return `${entry.id}-timestamp`;
};
export class MiniPlayer {
    constructor() {
        getElementOrThrow({ id: "mini-player-close" }).addEventListener(
            "click",
            () => {
                this.close();
            },
        );
        this.elements = {
            audio: getElementOrThrow({ id: "mini-player-audio-element" }),
            container: getElementOrThrow({ id: "mini-player" }),
            image: getElementOrThrow({ id: "mini-player-image" }),
            title: getElementOrThrow({ id: "mini-player-title" }),
        };
    }

    /**
     * TODO: we need to have tear down stuff when we switch between two entries
     *
     *
     * 1. unregister event handlers
     * 2. save audio duration
     */
    display(entry: POI) {
        if (this.activeEntry && entry.id !== this.activeEntry?.id) {
            info(
                `[MiniPlayer] switching from ${this.activeEntry?.id} to ${entry.id}`,
            );
        }

        this.activeEntry = entry;

        this.elements.title.textContent = entry.title;

        if (entry.imageName) {
            this.elements.image.src = `${import.meta.env.BASE_URL}images/${entry.imageName}`;
            this.elements.image.alt = entry.title;
        }

        this.elements.image.hidden = !entry.imageName;

        if (entry.audioName) {
            this.elements.audio.pause();

            const playbackKey = getPlaybackKey(entry);

            if (LocalStorageProvider.has(playbackKey)) {
                this.elements.audio.currentTime = JSON.parse(
                    LocalStorageProvider.getOrThrow(playbackKey),
                ) as number;
            } else {
                this.elements.audio.currentTime = 0;
            }

            this.elements.audio.src = `${import.meta.env.BASE_URL}audio/${entry.audioName}`;
            this.elements.audio.load();
            this.elements.audio.addEventListener("pause", () => {
                info("pause selected on", entry.id);
            });
        }

        this.elements.audio.hidden = !entry.audioName;

        this.elements.container.classList.remove("hidden");
        this.hidden = false;
    }

    close() {
        // TODO: hidden check here?
        this.elements.container.classList.add("hidden");
        this.hidden = true;
        this.elements.audio.pause();

        if (this.activeEntry) {
            const playbackKey = getPlaybackKey(this.activeEntry);
            LocalStorageProvider.set(
                playbackKey,
                JSON.stringify(this.elements.audio.currentTime),
            );
        } else {
            console.error("no active on close");
        }

        this.elements.audio.currentTime = 0;

        /**
         * TODO: this dependency chain seems weird.
         *
         * POITracker select triggers MiniPlayer display
         *
         * MiniPlayer close triggers POITracker's deselectActive
         *
         *
         * and now POITracker also calls this fn
         */
        poiTrackerInstance.deselectActive();
    }

    public hidden: boolean = true;

    // TODO: bad coupling...
    private activeEntry?: POI = undefined;

    private elements: {
        audio: HTMLAudioElement;
        container: HTMLElement;
        image: HTMLImageElement;
        title: HTMLElement;
    };
}

export const miniPlayerInstance = new MiniPlayer();
