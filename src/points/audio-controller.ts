import type { POI } from "../types";
import { debug, getElementOrThrow } from "../utils";
import { AudioElement } from "./audio-element";

const SEEK_INTERVAL_SECONDS = 15;

const formatRemainingTime = (currentTime: number, duration: number) => {
    if (!Number.isFinite(duration)) {
        return "--:--";
    }

    const remainingSeconds = Math.max(Math.ceil(duration - currentTime), 0);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `-${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export class AudioController {
    constructor() {
        this.elements = {
            audioElement: getElementOrThrow({ id: "poi-popup-audio-element" }),
            container: getElementOrThrow({ id: "poi-popup-audio" }),
            backButton: getElementOrThrow({ id: "poi-popup-audio-back" }),
            playPauseButton: getElementOrThrow({ id: "poi-popup-audio-toggle" }),
            forwardButton: getElementOrThrow({ id: "poi-popup-audio-forward" }),
            statusElement: getElementOrThrow({ id: "poi-popup-audio-status" }),
            timeRemainingElement: getElementOrThrow({
                id: "poi-popup-audio-time",
            }),
        };
        this.audio = AudioElement.create({ element: this.elements.audioElement });
    }

    setup({ poi }: { poi: POI }) {
        this.teardownUi();

        this.audio.configure(poi);
        this.elements.container.classList.remove("hidden");
        this.renderLoadingState();

        const backClickListener = () => {
            this.audio.seekBySeconds(-SEEK_INTERVAL_SECONDS);
            this.renderTime();
            this.renderStatus();
        };

        const playPauseClickListener = () => {
            void this.audio.togglePlayPause().catch((error: unknown) => {
                debug(`[AudioController] togglePlayPause failed: ${error}`);
            });
        };

        const forwardClickListener = () => {
            this.audio.seekBySeconds(SEEK_INTERVAL_SECONDS);
            this.renderTime();
            this.renderStatus();
        };

        this.elements.backButton.addEventListener("click", backClickListener);
        this.elements.playPauseButton.addEventListener(
            "click",
            playPauseClickListener,
        );
        this.elements.forwardButton.addEventListener(
            "click",
            forwardClickListener,
        );

        this.cleanups.push(() => {
            this.elements.backButton.removeEventListener(
                "click",
                backClickListener,
            );
            this.elements.playPauseButton.removeEventListener(
                "click",
                playPauseClickListener,
            );
            this.elements.forwardButton.removeEventListener(
                "click",
                forwardClickListener,
            );
        });

        this.cleanups.push(
            this.audio.on("loadedmetadata", () => {
                this.status = "ready";
                this.renderStatus();
                this.renderTime();
            }),
        );
        this.cleanups.push(
            this.audio.on("timeupdate", () => {
                this.renderTime();
            }),
        );
        this.cleanups.push(
            this.audio.on("play", () => {
                this.status = "playing";
                this.renderStatus();
            }),
        );
        this.cleanups.push(
            this.audio.on("pause", () => {
                const duration = this.audio.getDuration();
                const currentTime = this.audio.getCurrentTime();
                this.status =
                    Number.isFinite(duration) && currentTime >= duration
                        ? "finished"
                        : "paused";
                this.audio.saveCurrentTime();
                this.renderStatus();
                this.renderTime();
            }),
        );
        this.cleanups.push(
            this.audio.on("ended", () => {
                this.status = "finished";
                this.renderStatus();
                this.renderTime();
            }),
        );
    }

    teardown() {
        this.teardownUi();
        this.audio.teardown();
        this.elements.container.classList.add("hidden");
        this.status = "loading";
        this.renderLoadingState();
    }

    private audio: ReturnType<typeof AudioElement.create>;

    private cleanups: Array<() => void> = [];

    private elements: {
        audioElement: HTMLAudioElement;
        container: HTMLElement;
        backButton: HTMLButtonElement;
        playPauseButton: HTMLButtonElement;
        forwardButton: HTMLButtonElement;
        statusElement: HTMLElement;
        timeRemainingElement: HTMLElement;
    };

    private status: "finished" | "loading" | "paused" | "playing" | "ready" =
        "loading";

    private renderLoadingState() {
        this.elements.playPauseButton.textContent = "▶";
        this.elements.playPauseButton.setAttribute("aria-label", "Play audio");
        this.elements.statusElement.textContent = "Loading...";
        this.elements.timeRemainingElement.textContent = "--:--";
    }

    private renderStatus() {
        this.elements.playPauseButton.textContent = this.audio.isPaused()
            ? "▶"
            : "⏸";
        this.elements.playPauseButton.setAttribute(
            "aria-label",
            this.audio.isPaused() ? "Play audio" : "Pause audio",
        );

        this.elements.statusElement.textContent = {
            finished: "Finished",
            loading: "Loading...",
            paused: "Paused",
            playing: "Now playing",
            ready: "Ready to play",
        }[this.status];
    }

    private renderTime() {
        this.elements.timeRemainingElement.textContent = formatRemainingTime(
            this.audio.getCurrentTime(),
            this.audio.getDuration(),
        );
    }

    private teardownUi() {
        for (const cleanup of this.cleanups) {
            cleanup();
        }
        this.cleanups = [];
    }
}
