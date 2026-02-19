import { poiTrackerInstance } from "../points";
import type { POI } from "../types";
import { getElementOrThrow } from "../utils";

export class MiniPlayer {
    constructor() {
        getElementOrThrow({ id: "mini-player-close" }).addEventListener(
            "click",
            () => {
                this.close();
            },
        );
        this.audioElement = getElementOrThrow({
            id: "mini-player-audio-element",
        });
    }

    display(entry: POI) {
        // TODO: maybe keep track of these on the constructor?
        const element = getElementOrThrow({ id: "mini-player" });
        const titleElement = getElementOrThrow({ id: "mini-player-title" });

        titleElement.textContent = entry.title;

        const imageElement = getElementOrThrow({
            id: "mini-player-image",
        }) as HTMLImageElement;

        // TODO: remove
        if (entry.imageName) {
            imageElement.hidden = false;
            imageElement.src = `${import.meta.env.BASE_URL}images/${entry.imageName}`;
            imageElement.alt = entry.title;
        } else {
            imageElement.hidden = true;
        }

        // TODO: remove
        if (entry.audioName) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0; // TODO: save current time in local storage for each track?

            this.audioElement.src = `${import.meta.env.BASE_URL}audio/${entry.audioName}`;
            this.audioElement.load();
        }

        element.classList.remove("hidden");
        this.hidden = false;
    }

    close() {
        // TODO: hidden check here?

        getElementOrThrow({ id: "mini-player" }).classList.add("hidden");
        this.hidden = true;
        this.audioElement.pause();
        this.audioElement.currentTime = 0;

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
    private audioElement: HTMLAudioElement;
}

export const miniPlayerInstance = new MiniPlayer();
