import type { POI } from "../types";
import L from "leaflet";
import { poiIcon } from "./components/poi-icon";
import { poiPopup } from "./components/poi-popup";
import { mapLayers } from "./layers";

type MapConfiguartion = {
    POIs: Array<POI>;
    initialLocation: [number, number];
    initialZoom: number;
};

export const initMap = (config: MapConfiguartion) => {
    const map = L.map("map").setView(
        config.initialLocation,
        config.initialZoom,
    );

    // make satellite layer the default
    mapLayers.satellite.addTo(map);

    // TODO: orient map vertically

    // drop down for layers -- TODO: only in debug mode
    L.control.layers(mapLayers).addTo(map);

    config.POIs.forEach((entry, index) => {
        const { lattitude, longitude } = entry.location;

        L.marker([lattitude, longitude], {
            icon: poiIcon({ number: index, title: entry.title }),
        })
            .addTo(map)
            .bindPopup(poiPopup(entry));
    });
};
