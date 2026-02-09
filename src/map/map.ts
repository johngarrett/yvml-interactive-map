import type { POI } from "../types";
import L, { TileLayer } from "leaflet";
import { poiMarker } from "./components/poi-marker";
import { miniPlayerInstance } from "../miniplayer";
import { poiTrackerInstance } from "../points";

type MapConfiguartion = {
    POIs: Array<POI>;
    initialLocation: [number, number];
    initialZoom: number;
    defaultLayer: TileLayer;
    layers?: Record<string, TileLayer>;
};

export const initMap = (config: MapConfiguartion) => {
    const map = L.map("map").setView(
        config.initialLocation,
        config.initialZoom,
    );

    config.defaultLayer.addTo(map);

    // TODO: orient map vertically

    if (config.layers /* TODO: && buildFlag === "debug" */) {
        L.control.layers(config.layers).addTo(map);
    }

    config.POIs.forEach((entry, index) => {
        const { lattitude, longitude } = entry.location;

        L.marker([lattitude, longitude], {
            icon: poiMarker({ number: index + 1, title: entry.title }),
        })
            .addTo(map)
            .on("click", () => {
                poiTrackerInstance.markViewed(entry);
                miniPlayerInstance.display(entry);
            });
    });
};
