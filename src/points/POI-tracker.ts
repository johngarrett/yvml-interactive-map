import { markerIdForPOI } from "../map/components/poi-marker";
//import { miniPlayerInstance } from "../mini-player";
import { Observable } from "../observable";
import type { POI } from "../types";
import { debug, getElementOrThrow } from "../utils";

/**
 * if poi === undefined, item has been deselected
 */

export class POITracker extends Observable<POI | undefined> {
    select(poi: POI) {
        if (poi.id === this.activePOI?.id) {
            debug("[POITracker] POI already active, returning early");
            return;
        }

        this.deselectActive();
        this.activePOI = poi;

        this.viewed.add(poi);
        this.notify(poi);

        const poiMarker = getElementOrThrow({ id: markerIdForPOI(poi) });

        //miniPlayerInstance.display(poi);

        poiMarker.style.opacity = "0.7";
    }

    deselectActive() {
        debug("[POITracker] deselectActive");

        if (this.activePOI) {
            this.notify(undefined); // notify of deselection
        }

        this.activePOI = undefined;
        //if (!miniPlayerInstance.hidden) {
        //    miniPlayerInstance.close();
        //}
    }

    private activePOI: POI | undefined = undefined;
    private viewed: Set<POI> = new Set();
}

export const poiTrackerInstance = new POITracker();
