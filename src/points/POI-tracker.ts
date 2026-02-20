import { markerIdForPOI } from "../map/components/poi-marker";
import { miniPlayerInstance } from "../mini-player";
import type { POI } from "../types";
import { debug, getElementOrThrow } from "../utils";

export class POITracker {
    select(poi: POI) {
        if (poi.id === this.activePOI?.id) {
            debug("[POITracker] POI already active, returning early");
            return;
        }

        this.deselectActive();
        this.activePOI = poi;

        this.viewed.add(poi);

        const poiMarker = getElementOrThrow({ id: markerIdForPOI(poi) });

        miniPlayerInstance.display(poi);

        poiMarker.style.opacity = "0.7";
    }

    deselectActive() {
        debug("[POITracker] deselectActive");
        this.activePOI = undefined;
        if (!miniPlayerInstance.hidden) {
            miniPlayerInstance.close();
        }
    }

    private activePOI: POI | undefined = undefined;
    private viewed: Set<POI> = new Set();
}

export const poiTrackerInstance = new POITracker();
