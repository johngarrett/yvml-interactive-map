import type { POI } from "../types";
import L from "leaflet";

type POIPolygonControllerParams = {
    POIs: POI[];
};

const svgLabel = (title: string) =>
    `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 100 100"
     preserveAspectRatio="none">

  <text x="50"
        y="55"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="40"
        font-weight="bold">
    ${title}
  </text>
</svg>
`;

const poiToLayers = (poi: POI) => {
    const polygon = L.polygon(
        poi.polygon.path,
        poi.polygon.options,
    ).bindTooltip(poi.title, {
        permanent: true,
        direction: "center",
        className: "polygon-label",
    });

    const svg = svgLabel(poi.title);
    const label = L.svgOverlay(svg, polygon.getBounds(), {
        interactive: false,
    });

    return [polygon, label];
};

export class POIPolygonController {
    constructor({ POIs }: POIPolygonControllerParams) {
        // TODO: attach listener

        this.layer = L.layerGroup(POIs.flatMap(poiToLayers));
    }

    public layer: L.LayerGroup;
}
