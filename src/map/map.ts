import type { POI } from "../types";
import L, { TileLayer } from "leaflet";
import { poiIcon } from "./components/poi-icon";
import { poiPopup } from "./components/poi-popup";

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
            icon: poiIcon({ number: index, title: entry.title }),
        })
            .addTo(map)
            .bindPopup(poiPopup(entry));
    });
};
