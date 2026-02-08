import { type DivIcon, divIcon } from "leaflet";

type IconConfiguartion = {
    title: string;
    number: number;
};

export const poiIcon = (config: IconConfiguartion): DivIcon =>
    divIcon({
        className: "poi-marker-wrapper",
        html: `
            <div class="poi-marker">
              ${config.title}
            </div>
            `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
