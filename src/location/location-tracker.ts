import { debug, info } from "../utils";
import type { LocationPoint } from "./types";
import { Observable } from "../observable";
import { getConfig } from "../config";
import L from "leaflet";

export class LocationTracker extends Observable<LocationPoint> {
    /**
     * Initialize position tracker and EventListener
     */
    constructor() {
        // TODO: move this out
        super();

        document.addEventListener(
            "visibilitychange",
            this.handleVisibilityChange,
        );

        // Initialize map elements
        // TODO: map elements in this class feels like tight coupling
    }

    /**
     * start tracking via navigator.geolocation
     */
    public start = (): void => {
        if (this.watchId !== undefined) {
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            this.handlePosition,
            this.handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 2000, // TODO: see what this does
            },
        );

        debug(`[LocationTracker] watch started: ${this.watchId}`);
    };

    /**
     * end tracking based on the current watchId
     */
    public stop = (): void => {
        if (this.watchId !== undefined) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = undefined;
        }

        this.stopSmoothing();
        this.targetPoint = undefined;
        this.currentPoint = undefined;
    };

    private handleVisibilityChange = () => {
        debug("[LocationTracker] handleVisibilityChange");
        if (document.hidden) {
            this.stop();
        } else {
            // TODO: only if the user has hit the locate button
            this.start();
        }
    };

    private handlePosition = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = position.coords;
        const bounds = getConfig().getBounds();
        if (bounds && !bounds.contains([latitude, longitude])) {
            info(
                "[LocationTracker] location outside bounds, stopping tracking",
                {
                    latitude,
                    longitude,
                },
            );
            this.stop();
            return;
        }

        if (accuracy > 10) {
            info(
                `[LocationTracker] accuracy above 10, not notifying: ${accuracy}`,
            );
            return;
        } // TODO: getConfig().config.minAccuracy)

        const nextPoint: LocationPoint = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
        };

        // First valid fix after start: snap immediately.
        if (!this.targetPoint || !this.currentPoint) {
            this.targetPoint = nextPoint;
            this.currentPoint = nextPoint;
            this.stopSmoothing();
            this.notify(nextPoint);
            return;
        }

        const jumpDistanceMeters = L.latLng(
            this.targetPoint.latitude,
            this.targetPoint.longitude,
        ).distanceTo(L.latLng(nextPoint.latitude, nextPoint.longitude));

        this.targetPoint = nextPoint;

        // Large discontinuity (poor GPS/teleport): emit immediate snap.
        if (jumpDistanceMeters > this.largeJumpMeters) {
            this.currentPoint = nextPoint;
            this.stopSmoothing();
            this.notify(nextPoint);
            return;
        }

        this.startSmoothing();
    };

    // TODO: notify of stopping
    private handleError = (error: GeolocationPositionError) => {
        switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED: {
                info("permission denied", error);
                break;
            }
            case GeolocationPositionError.POSITION_UNAVAILABLE: {
                info("position unavailable", error);
                break;
            }
            case GeolocationPositionError.TIMEOUT: {
                info("timeout", error);
                break;
            }
            default: {
                info(error);
            }
        }
    };

    private startSmoothing = (): void => {
        if (this.frameId !== undefined) {
            return;
        }

        this.lastFrameTs = undefined;
        this.frameId = requestAnimationFrame(this.stepSmoothing);
    };

    private stopSmoothing = (): void => {
        if (this.frameId !== undefined) {
            cancelAnimationFrame(this.frameId);
            this.frameId = undefined;
        }
        this.lastFrameTs = undefined;
    };

    private stepSmoothing = (timestampMs: number): void => {
        if (!this.targetPoint || !this.currentPoint) {
            this.stopSmoothing();
            return;
        }

        const dtMs =
            this.lastFrameTs === undefined
                ? 16
                : Math.max(0, timestampMs - this.lastFrameTs);
        this.lastFrameTs = timestampMs;

        const alpha = 1 - Math.exp(-dtMs / this.tauMs);

        const latitude =
            this.currentPoint.latitude +
            (this.targetPoint.latitude - this.currentPoint.latitude) * alpha;
        const longitude =
            this.currentPoint.longitude +
            (this.targetPoint.longitude - this.currentPoint.longitude) * alpha;
        const accuracy =
            this.currentPoint.accuracy +
            (this.targetPoint.accuracy - this.currentPoint.accuracy) * alpha;

        this.currentPoint = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
        };

        this.notify(this.currentPoint);

        const remainingDistanceMeters = L.latLng(
            this.currentPoint.latitude,
            this.currentPoint.longitude,
        ).distanceTo(
            L.latLng(this.targetPoint.latitude, this.targetPoint.longitude),
        );
        if (remainingDistanceMeters < this.snapDistanceMeters) {
            this.currentPoint = {
                ...this.targetPoint,
                timestamp: Date.now(),
            };
            this.notify(this.currentPoint);
            this.stopSmoothing();
            return;
        }

        this.frameId = requestAnimationFrame(this.stepSmoothing);
    };

    private watchId: number | undefined;
    private targetPoint: LocationPoint | undefined;
    private currentPoint: LocationPoint | undefined;
    private frameId: number | undefined;
    private lastFrameTs: number | undefined;
    private readonly tauMs = 450;
    private readonly snapDistanceMeters = 0.5;
    private readonly largeJumpMeters = 25;
}
