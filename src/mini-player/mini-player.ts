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
    }
    display(entry: POI) {
        const element = getElementOrThrow({ id: "mini-player" });
        const titleElement = getElementOrThrow({ id: "mini-player-title" });

        titleElement.textContent = entry.title;
        element.classList.remove("hidden");
    }

    close() {
        getElementOrThrow({ id: "mini-player" }).classList.add("hidden");

        /**
         * TODO: this dependency chain seems weird.
         *
         * POITracker select triggers MiniPlayer display
         *
         * MiniPlayer close triggers POITracker's deselectActive
         */
        poiTrackerInstance.deselectActive();
    }
}

export const miniPlayerInstance = new MiniPlayer();
