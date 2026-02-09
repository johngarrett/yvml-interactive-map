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
              ${config.number}
            </div>
            `,
        //iconSize: [40, 40],
        //iconAnchor: [20, 20],
    });
