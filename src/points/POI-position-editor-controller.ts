import type { POI } from "../types";
import { getElementOrThrow } from "../utils";
import type { POIMarkerController } from "./POI-marker-controller";

const EDIT_MODE_QUERY_PARAM = "edit-pois";
const COORDINATE_PRECISION = 6;

const formatCoordinate = (value: number): string =>
    value.toFixed(COORDINATE_PRECISION);

const isEditModeEnabled = (): boolean => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(EDIT_MODE_QUERY_PARAM);

    return value === "1" || value === "true";
};

export class POIPositionEditorController {
    static isEnabled(): boolean {
        return isEditModeEnabled();
    }

    constructor({
        markerController,
        POIs,
    }: {
        markerController: POIMarkerController;
        POIs: POI[];
    }) {
        this.elements = {
            container: getElementOrThrow({ id: "poi-position-editor" }),
            copyButton: getElementOrThrow({ id: "poi-position-editor-copy" }),
            output: getElementOrThrow({ id: "poi-position-editor-output" }),
            status: getElementOrThrow({ id: "poi-position-editor-status" }),
        };

        this.positions = new Map(
            POIs.map((poi) => [
                poi.id,
                {
                    poi,
                    latitude: poi.location.latitude,
                    longitude: poi.location.longitude,
                },
            ]),
        );

        this.elements.container.classList.remove("hidden");
        this.renderOutput();

        this.elements.copyButton.addEventListener("click", async () => {
            const nextOutput = this.buildOutput();

            try {
                await navigator.clipboard.writeText(nextOutput);
                this.setStatus("Copied update block to clipboard.");
            } catch {
                this.elements.output.focus();
                this.elements.output.select();
                this.setStatus(
                    "Clipboard write failed. The update block is selected for manual copy.",
                );
            }
        });

        markerController.enablePositionEditing({
            onPositionChange: ({ poi, latitude, longitude }) => {
                this.positions.set(poi.id, {
                    poi,
                    latitude,
                    longitude,
                });

                this.renderOutput();
                this.setStatus(
                    `Updated ${poi.title}: ${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`,
                );
            },
        });
    }

    private buildOutput(): string {
        return Array.from(this.positions.values())
            .map(({ poi, latitude, longitude }) => {
                return [
                    `${poi.title} (${poi.id})`,
                    `latitude: ${formatCoordinate(latitude)},`,
                    `longitude: ${formatCoordinate(longitude)},`,
                ].join("\n");
            })
            .join("\n\n");
    }

    private renderOutput() {
        this.elements.output.value = this.buildOutput();
    }

    private setStatus(message: string) {
        this.elements.status.textContent = message;
    }

    private readonly elements: {
        container: HTMLElement;
        copyButton: HTMLButtonElement;
        output: HTMLTextAreaElement;
        status: HTMLElement;
    };

    private readonly positions: Map<
        string,
        {
            poi: POI;
            latitude: number;
            longitude: number;
        }
    >;
}
