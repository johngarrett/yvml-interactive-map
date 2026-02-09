import type { POI } from "../types";

export class POITracker {
    markViewed(poi: POI) {
        this.viewed.add(poi);
        console.log(this.viewed);

        // TODO; style css
    }

    private viewed: Set<POI> = new Set();
}

export const poiTrackerInstance = new POITracker();
