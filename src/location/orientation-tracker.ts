import { Observable } from "../observable";

export type OrientationData = {
    /**
     * Rotation around the z-axis
     */
    alpha: number | undefined;
    //beta: number | undefined;
    //gamma: number | undefined;
    absolute: boolean;
};

export class OrientationTracker extends Observable<OrientationData> {
    constructor() {
        super();
    }

    public requestOrientationPermission = async (): Promise<boolean> => {
        // iOS 13+ requires explicit permission
        if (
            "requestPermission" in DeviceOrientationEvent &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            try {
                const permission =
                    await DeviceOrientationEvent.requestPermission();
                if (permission === "granted") {
                    this.startOrientationTracking();
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Orientation permission error:", error);
                return false;
            }
        } else {
            // Android and older browsers
            this.startOrientationTracking();
            return true;
        }
    };

    private startOrientationTracking = () => {
        window.addEventListener("deviceorientation", this.orientationListener);
    };

    private orientationListener = (event: DeviceOrientationEvent) => {
        this.notify({
            alpha: event.alpha ?? undefined,
            absolute: event.absolute ?? false,
        });
    };
}
