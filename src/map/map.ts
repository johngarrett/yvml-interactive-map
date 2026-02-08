import type { POI } from "../types";
import L from "leaflet";

type MapConfiguartion = {
  POIs: Array<POI>;
  initialLocation?: [number, number];
  initialZoom?: number;
}

export const initMap = (config: MapConfiguartion) => {
  // TODO: make vertical
  const map = L.map("map").setView(config.initialLocation ?? [34.1820592, -116.416779], config.initialZoom ?? 50);

  //L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //  attribution: "© OpenStreetMap contributors",
  //}).addTo(map);

  // satallite
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }).addTo(map);

  L.marker(([34.19, -116.416779]))
    .addTo(map)
    .bindPopup("Hello world")
    .openPopup();
}
