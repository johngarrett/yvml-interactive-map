import type { POI } from "../types";
import L from "leaflet";

type MapConfiguartion = {
    POIs: Array<POI>;
    initialLocation: [number, number];
    initialZoom: number;
};

export const initMap = (config: MapConfiguartion) => {
    // TODO: make vertical
    const map = L.map("map").setView(
        config.initialLocation,
        config.initialZoom,
    );

    //L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    //  attribution: "© OpenStreetMap contributors",
    //}).addTo(map);

    // satallite
    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 30,
            maxNativeZoom: 17,
            attribution:
                "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
    ).addTo(map);

    config.POIs.forEach((entry) => {
        const { lattitude, longitude } = entry.location;

        L.marker([lattitude, longitude]).addTo(map).bindPopup(entry.title);
    });
};
