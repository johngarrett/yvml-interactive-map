import { poiTrackerInstance } from "../points";
import type { POI } from "../types";

export class MiniPlayer {
    constructor() {
        const closeButton = document.getElementById("mini-player-close");
        if (!closeButton) {
            throw Error("no close button element found");
        }

        closeButton.addEventListener("click", () => {
            this.close();
        });
    }
    display(entry: POI) {
        const element = document.getElementById("mini-player");
        if (!element) {
            throw Error("no mini-player element found");
        }

        const titleElement = document.getElementById("mini-player-title");
        if (!titleElement) {
            throw Error("no titleElement found");
        }

        titleElement.textContent = entry.title;
        element?.classList.remove("hidden");
    }

    close() {
        const element = document.getElementById("mini-player");
        if (!element) {
            throw Error("no mini-player element found");
        }
        element.classList.add("hidden");

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
