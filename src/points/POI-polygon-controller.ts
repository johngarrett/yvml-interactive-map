import type { POI } from "../types";
import L from "leaflet";
import { debug } from "../utils";

type POIPolygonControllerParams = {
    POIs: POI[];
};

// TODO: font
const svgLabel = () =>
    `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 100 100"
     preserveAspectRatio="none">

  <text id="label-text"
    x="50"
    y="50"
    transform="rotate(180 50 50)"
    font-weight="900"
    font-family="Futura"
    textLength="100"
    text-anchor="middle"
    lengthAdjust="spacingAndGlyphs"
    dominant-baseline="middle"
    fill="black">
  </text>
</svg>
`;

const poiToLayers = (poi: POI) => {
    const polygon = L.polygon(poi.polygon.path, poi.polygon.options);

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgLabel(), "image/svg+xml");

    const svgElement = svgDoc.documentElement as unknown as SVGElement;

    const labelText = svgElement.querySelector(
        "#label-text",
    ) as SVGTextElement | null;

    if (!labelText) {
        debug("no element");
    } else {
        labelText.innerHTML = "";

        const lines = poi.title.split(" ");
        const lineCount = lines.length;

        const lineHeightMultiplier = 1.1;

        // Fit entire text block inside 100 viewBox units
        const fontSize = 100 / (lineCount * lineHeightMultiplier);

        const lineHeight = fontSize * lineHeightMultiplier;
        const totalHeight = lineHeight * (lineCount - 1);
        const startOffset = -totalHeight / 2;

        labelText.setAttribute("font-size", fontSize.toString());

        lines.forEach((line, i) => {
            const tspan = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "tspan",
            );

            tspan.setAttribute("x", "50");
            tspan.setAttribute(
                "dy",
                i === 0 ? `${startOffset}` : `${lineHeight}`,
            );

            // Stretch each line independently across full width
            tspan.setAttribute("textLength", "100");
            tspan.setAttribute("lengthAdjust", "spacingAndGlyphs");

            tspan.textContent = line;
            labelText.appendChild(tspan);
        });
    }

    const label = L.svgOverlay(svgElement, polygon.getBounds(), {
        interactive: false,
    });

    return [polygon, label];
    //const polygon = L.polygon(
    //    poi.polygon.path,
    //    poi.polygon.options,
    //).bindTooltip(poi.title, {
    //    permanent: true,
    //    direction: "center",
    //    className: "polygon-label",
    //});

    //// Create an SVG DOM element for the overlay so Leaflet
    //// receives a proper element instead of a plain string.
    //const parser = new DOMParser();
    //const svgElement = parser.parseFromString(
    //    svgLabel(),
    //    "image/svg+xml",
    //).documentElement;

    //// TODO: cleanup and docuemnt
    //const labelText = svgElement.querySelector("#label-text");
    //if (labelText) {
    //    //labelText.textContent = poi.title;
    //    const lines = poi.title.split(" ");
    //    labelText.innerHTML = "";
    //    const fontSize = 60;
    //    const lineHeight = fontSize * 1.1; // 10% breathing room

    //    lines.forEach((line, i) => {
    //        const tspan = document.createElementNS(
    //            "http://www.w3.org/2000/svg",
    //            "tspan",
    //        );
    //        tspan.setAttribute("x", "0");
    //        //tspan.setAttribute("dy", i === 0 ? "0" : "30");
    //        tspan.setAttribute(
    //            "dy",
    //            i === 0 ? `${-lineHeight / 2}` : `${lineHeight}`,
    //        );
    //        tspan.textContent = line;
    //        labelText.appendChild(tspan);
    //    });
    //} else {
    //    debug("no element");
    //}

    //debug(svgElement);

    //const label = L.svgOverlay(
    //    svgElement as unknown as SVGElement, // TODO; remove casting
    //    polygon.getBounds(),
    //    {
    //        interactive: false,
    //    },
    //);

    //return [polygon, label];
};

export class POIPolygonController {
    constructor({ POIs }: POIPolygonControllerParams) {
        // TODO: attach listener

        this.layer = L.layerGroup(POIs.flatMap(poiToLayers));
    }

    public layer: L.LayerGroup;
}
