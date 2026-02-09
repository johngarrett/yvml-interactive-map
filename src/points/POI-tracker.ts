import { markerIdForPOI } from "../map/components/poi-marker";
import { miniPlayerInstance } from "../miniplayer";
import type { POI } from "../types";

export class POITracker {
    select(poi: POI) {
        if (poi.id !== this.activePOI?.id) {
            this.activePOI = poi;
        } else {
            console.log("POI already active");
            return;
        }

        this.viewed.add(poi);
        console.log(this.viewed);

        // TODO: helper fn
        const poiMarker = document.getElementById(markerIdForPOI(poi));
        if (!poiMarker) {
            throw Error("missing POI marker");
        }

        miniPlayerInstance.display(poi);

        poiMarker.style.opacity = "0.5";
    }

    deselectActive() {
        this.activePOI = undefined;
    }

    private activePOI: POI | undefined = undefined;
    private viewed: Set<POI> = new Set();
}

export const poiTrackerInstance = new POITracker();
