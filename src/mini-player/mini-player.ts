import { poiTrackerInstance } from "../points";
import { LocalStorageProvider } from "../storage";
import type { POI } from "../types";
import { debug, getElementOrThrow, info } from "../utils";

type AudioElementWithController = HTMLAudioElement & {
    controller: AbortController;
};

// TODO: new file for these

const getTimestampKey = (entry: POI) => {
    return `${entry.id}-timestamp`;
};

/**
 * setup HTMLAudioElement
 *
 * 1. pull timestamp from local storage
 * 2. load media
 * 3. add event listener
 */
const setupAudioElement = ({
    entry,
    element,
    controller,
}: {
    entry: POI;
    element: HTMLAudioElement;
    controller: AbortController;
}) => {
    element.pause();

    const timestampKey = getTimestampKey(entry);

    if (LocalStorageProvider.has(timestampKey)) {
        element.currentTime = Number(
            JSON.parse(LocalStorageProvider.getOrThrow(timestampKey)),
        );
    } else {
        debug("AudioElement: no timestampKey found, setting currentTime to 0");
        element.currentTime = 0;
    }

    element.src = `${import.meta.env.BASE_URL}audio/${entry.audioName}`;
    element.load();

    /*
     * save audio timestamp whenever the audio is paused
     */
    element.addEventListener(
        "pause",
        () => {
            debug(`AudioElement: pause selected on ${entry.id}`);
            LocalStorageProvider.set(
                timestampKey,
                JSON.stringify(element.currentTime),
            );
            debug("pause listener attached with controller:", controller);
        },
        { signal: controller.signal },
    );
};

/**
 * teardown HTMLAudioElement
 *
 * 1. save timestamp to local storage
 * 2. pause media
 * 3. remove event listener
 */
const teardownAudioElement = ({
    element,
    controller,
}: {
    element: HTMLAudioElement;
    controller: AbortController;
}) => {
    debug("AudioElement: teardown. controller: ", controller);

    if (!element.paused) {
        debug("AudioElement: audio wasn't paused, calling pause");
        element.pause();
    }

    // removes the listener
    controller.abort();
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
     * called whenever POITracker sees a switch
     */
    display(entry: POI) {
        /**
         * abort existing listeners
         */
        this.audioAbortController.abort();
        /**
         * create a new abort controller whenever we switched
         */
        this.audioAbortController = new AbortController();

        this.elements.title.textContent = entry.title;

        if (entry.imageName) {
            this.elements.image.src = `${import.meta.env.BASE_URL}images/${entry.imageName}`;
            this.elements.image.alt = entry.title;
        }

        this.elements.image.hidden = !entry.imageName;

        if (entry.audioName) {
            setupAudioElement({
                entry,
                element: this.elements.audio,
                controller: this.audioAbortController,
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

        teardownAudioElement({
            element: this.elements.audio,
            controller: this.audioAbortController,
        });

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
        audio: AudioElementWithController;
        container: HTMLElement;
        image: HTMLImageElement;
        title: HTMLElement;
    };

    private audioAbortController = new AbortController();
}

export const miniPlayerInstance = new MiniPlayer();
