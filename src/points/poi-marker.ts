import { type DivIcon, divIcon } from "leaflet";
import type { POI } from "../types";

/**
 * Marker labels stay numeric until the map is zoomed in close enough that
 * showing POI titles is more useful than preserving the compact circular form.
 */
export const POI_TITLE_ZOOM_THRESHOLD = 21;

/**
 * Label swaps are animated with a short fade so switching between number mode
 * and title mode feels less abrupt during zoom changes.
 */
const MARKER_LABEL_FADE_DURATION_MS = 120;
const markerFadeTimers = new WeakMap<HTMLElement, number>();

type IconConfiguration = {
    POI: Pick<POI, "id" | "title">;
    number: number;
};

export const markerIdForPOI = (poi: Pick<POI, "id">): string =>
    `poi-marker-${poi.id}`;

/**
 * Returns the visible label for a marker at a given zoom level.
 */
const markerLabelForZoom = (
    config: IconConfiguration,
    zoomLevel: number,
): string =>
    zoomLevel >= POI_TITLE_ZOOM_THRESHOLD
        ? config.POI.title
        : config.number.toString();

export const poiMarker = (config: IconConfiguration): DivIcon =>
    divIcon({
        className: "poi-marker-wrapper",
        html: `
            <div class="font-bold poi-marker poi-marker-number" id="${markerIdForPOI(config.POI)}">
              ${markerLabelForZoom(config, 0)}
            </div>
            `,
    });

/**
 * Updates the existing marker DOM in place so Leaflet marker instances,
 * click handlers, and selected-marker styling remain intact across zoom-based
 * label mode changes.
 */
export const updatePOIMarkerLabel = ({
    element,
    number,
    POI,
    zoomLevel,
}: {
    element: HTMLElement;
    number: number;
    POI: Pick<POI, "title">;
    zoomLevel: number;
}): void => {
    const showTitle = zoomLevel >= POI_TITLE_ZOOM_THRESHOLD;
    const nextText = showTitle ? POI.title : number.toString();
    const isAlreadyShowingNextState =
        element.textContent === nextText &&
        element.classList.contains("poi-marker-title") === showTitle;

    if (isAlreadyShowingNextState) {
        return;
    }

    const existingTimer = markerFadeTimers.get(element);
    if (existingTimer) {
        window.clearTimeout(existingTimer);
    }

    element.classList.add("poi-marker-fading");

    const timer = window.setTimeout(() => {
        element.textContent = nextText;
        element.classList.toggle("poi-marker-title", showTitle);
        element.classList.toggle("poi-marker-number", !showTitle);

        requestAnimationFrame(() => {
            element.classList.remove("poi-marker-fading");
        });

        markerFadeTimers.delete(element);
    }, MARKER_LABEL_FADE_DURATION_MS);

    markerFadeTimers.set(element, timer);
};
