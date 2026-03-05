import type L from "leaflet";
import type { FeatureFlagProvider } from "../feature-flags";
import type { LocationTracker, OrientationTracker } from "../location";

type LatLngTuple = [number, number];

type MapMovementControllerParams = {
    map: L.Map;
    locationTracker: LocationTracker;
    orientationTracker: OrientationTracker;
    featureFlagProvider: FeatureFlagProvider;
};

export class MapMovementController {
    constructor({
        map,
        locationTracker,
        orientationTracker,
        featureFlagProvider,
    }: MapMovementControllerParams) {
        this.map = map;
        this.locationTracker = locationTracker;
        this.orientationTracker = orientationTracker;

        if (featureFlagProvider.get("locationFollowAndRotate").value) {
            this.enable();
        } else {
            this.disable();
        }

        featureFlagProvider.addListener(({ key, value }) => {
            if (key !== "locationFollowAndRotate") {
                return;
            }

            if (value) {
                this.enable();
            } else {
                this.disable();
            }
        });
    }

    private enable = () => {
        if (!this.unsubscribeLocationFollow) {
            this.unsubscribeLocationFollow = this.locationTracker.addListener(
                ({ latitude, longitude }) => {
                    const nextTarget: LatLngTuple = [latitude, longitude];

                    // First fix after enabling follow: snap to avoid startup drift.
                    if (!this.targetLatLng || !this.currentLatLng) {
                        this.targetLatLng = nextTarget;
                        this.currentLatLng = nextTarget;
                        this.map.setView(nextTarget, this.map.getZoom(), {
                            animate: false,
                        });
                        this.stopFollowAnimation();
                        return;
                    }

                    const jumpDistanceMeters = this.distanceMeters(
                        this.targetLatLng,
                        nextTarget,
                    );
                    this.targetLatLng = nextTarget;

                    // Snap immediately on large discontinuities.
                    if (jumpDistanceMeters > this.largeJumpMeters) {
                        this.currentLatLng = nextTarget;
                        this.map.setView(nextTarget, this.map.getZoom(), {
                            animate: false,
                        });
                        this.stopFollowAnimation();
                        return;
                    }

                    this.startFollowAnimation();
                },
            );
        }

        if (!this.unsubscribeRotation) {
            this.unsubscribeRotation = this.orientationTracker.addListener(
                ({ heading }) => {
                    // Invert for map rotation:
                    // when user turns left, map rotates clockwise.
                    const corrected = (360 - heading) % 360;
                    this.map.setBearing(corrected);
                },
            );
        }
    };

    private disable = () => {
        if (this.unsubscribeLocationFollow) {
            this.unsubscribeLocationFollow();
            this.unsubscribeLocationFollow = undefined;
        }
        if (this.unsubscribeRotation) {
            this.unsubscribeRotation();
            this.unsubscribeRotation = undefined;
        }

        this.stopFollowAnimation();
        this.targetLatLng = undefined;
        this.currentLatLng = undefined;
    };

    private startFollowAnimation = (): void => {
        if (this.rafId !== undefined) {
            return;
        }

        this.lastFrameTs = undefined;
        this.rafId = requestAnimationFrame(this.stepFollowAnimation);
    };

    private stopFollowAnimation = (): void => {
        if (this.rafId !== undefined) {
            cancelAnimationFrame(this.rafId);
            this.rafId = undefined;
        }
        this.lastFrameTs = undefined;
    };

    private stepFollowAnimation = (timestampMs: number): void => {
        if (!this.targetLatLng || !this.currentLatLng) {
            this.stopFollowAnimation();
            return;
        }

        const dtMs =
            this.lastFrameTs === undefined
                ? 16
                : Math.max(0, timestampMs - this.lastFrameTs);
        this.lastFrameTs = timestampMs;

        const alpha = 1 - Math.exp(-dtMs / this.tauMs);
        const [currentLat, currentLng] = this.currentLatLng;
        const [targetLat, targetLng] = this.targetLatLng;

        const nextLat = currentLat + (targetLat - currentLat) * alpha;
        const nextLng = currentLng + (targetLng - currentLng) * alpha;

        this.currentLatLng = [nextLat, nextLng];

        const remainingDistanceMeters = this.distanceMeters(
            this.currentLatLng,
            this.targetLatLng,
        );
        if (remainingDistanceMeters < this.snapDistanceMeters) {
            this.currentLatLng = this.targetLatLng;
            this.map.panTo(this.targetLatLng, { animate: false });
            this.stopFollowAnimation();
            return;
        }

        this.map.panTo(this.currentLatLng, { animate: false });
        this.rafId = requestAnimationFrame(this.stepFollowAnimation);
    };

    private distanceMeters = (a: LatLngTuple, b: LatLngTuple): number => {
        const earthRadiusMeters = 6371000;
        const toRadians = Math.PI / 180;

        const [latitudeA, longitudeA] = a;
        const [latitudeB, longitudeB] = b;

        const latitudeDelta = (latitudeB - latitudeA) * toRadians;
        const longitudeDelta = (longitudeB - longitudeA) * toRadians;
        const latitudeARadians = latitudeA * toRadians;
        const latitudeBRadians = latitudeB * toRadians;

        const h =
            Math.sin(latitudeDelta / 2) ** 2 +
            Math.cos(latitudeARadians) *
                Math.cos(latitudeBRadians) *
                Math.sin(longitudeDelta / 2) ** 2;

        return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    };

    private map: L.Map;
    private locationTracker: LocationTracker;
    private orientationTracker: OrientationTracker;
    private unsubscribeLocationFollow: (() => void) | undefined;
    private unsubscribeRotation: (() => void) | undefined;
    private targetLatLng: LatLngTuple | undefined;
    private currentLatLng: LatLngTuple | undefined;
    private rafId: number | undefined;
    private lastFrameTs: number | undefined;
    private readonly tauMs = 450;
    private readonly snapDistanceMeters = 0.5;
    private readonly largeJumpMeters = 25;
}
