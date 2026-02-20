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
}: {
    entry: POI;
    element: HTMLAudioElement;
}) => {
    element.pause();

    const timestampKey = getTimestampKey(entry);
    const savedTime = LocalStorageProvider.has(timestampKey)
        ? Number(JSON.parse(LocalStorageProvider.getOrThrow(timestampKey)))
        : 0;

    if (!LocalStorageProvider.has(timestampKey)) {
        debug("AudioElement: no timestampKey found, will start at 0");
    }

    element.src = `${import.meta.env.BASE_URL}audio/${entry.audioName}`;
    element.load();

    /*
     * Safari (and WebKit) ignores currentTime set before src/load(); set it
     * after metadata is loaded so resume works correctly.
     */
    const applyResumePosition = () => {
        element.currentTime = savedTime;
        element.removeEventListener("loadedmetadata", applyResumePosition);
    };
    element.addEventListener("loadedmetadata", applyResumePosition);

    /*
     * save audio timestamp whenever the audio is paused
     */
    // TODO: maybe break this out into a 'save' function and that will maintian the lifecycle
    const listener = () => {
        debug(`AudioElement: pause selected on ${entry.id}`);
        LocalStorageProvider.set(
            timestampKey,
            JSON.stringify(element.currentTime),
        );
    };

    element.addEventListener("pause", listener);

    return listener;
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
    listener,
    entry,
}: {
    element: HTMLAudioElement;
    listener: () => void;
    entry: POI;
}) => {
    debug("AudioElement: teardown");

    if (!element.paused) {
        debug("AudioElement: audio wasn't paused, calling pause");
        element.pause();
    }

    LocalStorageProvider.set(
        getTimestampKey(entry),
        JSON.stringify(element.currentTime),
    );

    // TODO: is there a way to remove ALL event listeners?
    element.removeEventListener("pause", listener);
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
        if (this.active?.entry && entry.id !== this.active.entry?.id) {
            info(
                `[MiniPlayer] switching from ${this.active.entry?.id} to ${entry.id}`,
            );
        }

        this.active = { entry };

        this.elements.title.textContent = entry.title;

        if (entry.imageName) {
            this.elements.image.src = `${import.meta.env.BASE_URL}images/${entry.imageName}`;
            this.elements.image.alt = entry.title;
        }

        this.elements.image.hidden = !entry.imageName;

        if (entry.audioName) {
            this.active.listener = setupAudioElement({
                entry,
                element: this.elements.audio,
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

        if (this.active?.listener) {
            teardownAudioElement({
                element: this.elements.audio,
                entry: this.active.entry,
                listener: this.active.listener,
            });
        } else {
            debug("no active listener, not tearing down audio");
        }

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

    private active?: {
        entry: POI;
        listener?: () => void;
    };
}

export const miniPlayerInstance = new MiniPlayer();
