import { type DivIcon, divIcon } from "leaflet";

type IconConfiguartion = {
    title: string;
    number: number;
};

export const poiMarker = (config: IconConfiguartion): DivIcon =>
    divIcon({
        className: "poi-marker-wrapper",
        html: `
            <div class="font-bold poi-marker">
              ${config.title}
            </div>
            `,
        iconSize: [100, 40],
        iconAnchor: [20, 40],
    });
