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
        this.elements = {
            audio: getElementOrThrow({ id: "mini-player-audio-element" }),
            container: getElementOrThrow({ id: "mini-player" }),
            image: getElementOrThrow({ id: "mini-player-image" }),
            title: getElementOrThrow({ id: "mini-player-title" }),
        };
    }

    display(entry: POI) {
        this.elements.title.textContent = entry.title;

        if (entry.imageName) {
            this.elements.image.src = `${import.meta.env.BASE_URL}images/${entry.imageName}`;
            this.elements.image.alt = entry.title;
        }

        this.elements.image.hidden = !entry.imageName;

        if (entry.audioName) {
            this.elements.audio.pause();
            this.elements.audio.currentTime = 0; // TODO: save current time in local storage for each track?

            this.elements.audio.src = `${import.meta.env.BASE_URL}audio/${entry.audioName}`;
            this.elements.audio.load();
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

    private elements: {
        audio: HTMLAudioElement;
        container: HTMLElement;
        image: HTMLImageElement;
        title: HTMLElement;
    };
}

export const miniPlayerInstance = new MiniPlayer();
