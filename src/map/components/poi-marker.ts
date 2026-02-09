import { type DivIcon, divIcon } from "leaflet";
import type { POI } from "../../types";

type IconConfiguartion = {
    POI: Pick<POI, "id">;
    number: number;
};

export const markerIdForPOI = (poi: Pick<POI, "id">): string =>
    `poi-marker-${poi.id}`;

export const poiMarker = (config: IconConfiguartion): DivIcon =>
    divIcon({
        className: "poi-marker-wrapper",
        html: `
            <div class="font-bold poi-marker" id=${markerIdForPOI(config.POI)}>
              ${config.number}
            </div>
            `,
    });
