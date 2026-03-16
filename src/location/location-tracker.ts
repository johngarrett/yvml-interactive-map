import { debug, info } from "../utils";
import type { LocationPoint } from "./types";
import { Observable } from "../observable";
import { getConfig } from "../config";

type StartResult =
    | {
          result: "success";
          initialLocation: LocationPoint;
      }
    | {
          result: "failure";
          reason: "out-of-bounds" | "permission-denied" | "unknown";
      };

// TODO: locationPoit isn't enough to emit for observability
export class LocationTracker extends Observable<LocationPoint> {
    /**
     * Initialize EventListener
     */
    constructor() {
        // TODO: move this out
        super();

        document.addEventListener(
            "visibilitychange",
            this.handleVisibilityChange,
        );
    }

    // TODO: breaking out to help me think
    public getInitialLocation = async (): StartResult => {
        try {
            // grab intiial location
            const position = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 2000,
                    });
                },
            );
        } catch (e) {
            if (!(e instanceof GeolocationPositionError)) {
            }
        }
    };

    private isWithinBounds = ({
        latitude,
        longitude,
    }: Pick<LocationPoint, "latitude" | "longitude">) => {
        const bounds = getConfig().getBounds();
        if (bounds && !bounds.contains([latitude, longitude])) {
            info("[LocationTracker] location outside bounds", {
                latitude,
                longitude,
            });
            return false;
        }
        return true;
    };
    /**
     * start tracking via navigator.geolocation
     */
    public start = async (): void => {
        if (this.watchId !== undefined) {
            return;
        }

        // TODO: call getPosition and return a boolean here
        // true: tracking began successfully
        // false: it didnt (permission denied, out of bounds, bad accuracy)
        //
        //
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
        if (!this.isWithinBounds(position.coords)) {
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

        this.notify({
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
        });
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

    private watchId: number | undefined;
}
