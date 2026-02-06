import L from "leaflet";

// TODO: make vertical
const map = L.map("map").setView([34.1820592, -116.416779], 50);

//L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//  attribution: "© OpenStreetMap contributors",
//}).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

L.marker(([34.19, -116.416779]))
  .addTo(map)
  .bindPopup("Hello world")
  .openPopup();
