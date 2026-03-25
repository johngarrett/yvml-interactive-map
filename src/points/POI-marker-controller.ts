import L from "leaflet";
import type { POI } from "../types";
import { getElementOrThrow } from "../utils";
import type { POITracker } from "./POI-tracker";
import {
    markerIdForPOI,
    poiMarker,
    POI_TITLE_ZOOM_THRESHOLD,
    updatePOIMarkerLabel,
} from "./poi-marker";

/**
 * Owns the Leaflet marker layer for POIs.
 *
 * Responsibilities:
 * - create the on-map POI markers
 * - translate marker clicks into POITracker selections
 * - apply persistent selected-marker styling when POITracker changes
 */
export class POIMarkerController {
    constructor({ poiTracker, POIs }: { poiTracker: POITracker; POIs: POI[] }) {
        this.markers = POIs.map((POI, index) => {
            const { latitude, longitude } = POI.location;

            return {
                POI,
                number: index + 1,
                marker: L.marker([latitude, longitude], {
                    icon: poiMarker({ number: index + 1, POI }),
                }).on("click", () => {
                    poiTracker.select(POI);
                }),
            };
        });

        this.layer = L.layerGroup(this.markers.map(({ marker }) => marker));

        poiTracker.addListener((activePOI) => {
            this.markers.forEach(({ POI }) => {
                const markerElement = getElementOrThrow({
                    id: markerIdForPOI(POI),
                });
                const isActive = POI.id === activePOI?.id;

                markerElement.classList.toggle("poi-marker-selected", isActive);
                markerElement.style.opacity =
                    !isActive && poiTracker.hasViewed(POI) ? "0.7" : "";
            });
        });
    }

    updateForZoom(zoomLevel: number) {
        const showTitle = zoomLevel >= POI_TITLE_ZOOM_THRESHOLD;

        // Zoom changes within the same label mode don't need any DOM work.
        if (this.lastShowTitle === showTitle) {
            return;
        }

        this.lastShowTitle = showTitle;

        this.markers.forEach(({ POI, number }) => {
            const element = getElementOrThrow({ id: markerIdForPOI(POI) });

            updatePOIMarkerLabel({
                element,
                number,
                POI,
                zoomLevel,
            });
        });
    }

    public layer: L.LayerGroup;
    private markers: Array<{
        POI: POI;
        number: number;
        marker: L.Marker;
    }>;
    private lastShowTitle: boolean | undefined;
}
