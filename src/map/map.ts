import type { POI } from "../types";
import L, { TileLayer, type MapOptions } from "leaflet";
import { poiMarker } from "./components/poi-marker";
import { poiTrackerInstance } from "../points";

type MapConfiguartion = {
    POIs: Array<POI>;
    initialLocation: [number, number];
    initialZoom: number;
    defaultLayer: TileLayer;
    layers?: Record<string, TileLayer>;
};

export const initMap = (config: MapConfiguartion) => {
    const map = L.map(
        "map",
        {
            rotate: true,
            bearing: 180, // start upside down
            touchRotate: true,
            rotateControl: undefined,
        } as unknown as MapOptions /* these come from the extension */,
    )
        .setView(config.initialLocation, config.initialZoom)
        .on("click", () => {
            // deselect the active POI when the user clicks outside on the map
            poiTrackerInstance.deselectActive();
        });

    config.defaultLayer.addTo(map);

    // TODO: orient map vertically

    if (config.layers /* TODO: && buildFlag === "debug" */) {
        L.control.layers(config.layers).addTo(map);
    }

    config.POIs.forEach((POI, index) => {
        const { lattitude, longitude } = POI.location;

        L.marker([lattitude, longitude], {
            icon: poiMarker({ number: index + 1, POI }),
        })
            .addTo(map)
            .on("click", () => {
                poiTrackerInstance.select(POI);
            });
    });

    map.locate({
        /* watch: true */
    });

    map.on("locationerror", (e) => {
        console.error(e);
    });
    map.on("locationfound", (e) => {
        // TODO: remove previous circle, get orientation
        const radius = e.accuracy;

        L.circle(e.latlng, { radius }).addTo(map);
    });
};
