import type { POI } from "../types";
import L, { Layer, TileLayer, type MapOptions } from "leaflet";
import { poiMarker } from "./components/poi-marker";
import { POITracker } from "../points";
import { debug } from "../utils";
import type { LocationController } from "../location/location-controller";
import type { LocationTracker, OrientationTracker } from "../location";

type MapConfiguration = {
    initialLocation: [number, number];
    initialZoom: number;
    defaultLayer: TileLayer;
    tileLayers?: Record<string, TileLayer>;
    mapOptions: MapOptions & {
        /* from leaflet-rotate */
        rotate: boolean;
        bearing: number;
        touchRotate: boolean;
        rotateControl: unknown;
    };
};

type MapParameters = {
    config: MapConfiguration;
    providers: {
        poiTracker: POITracker;

        orientationTracker: OrientationTracker;
        locationTracker: LocationTracker;

        locationController: LocationController;
    };
    additionalLayers?: Layer[];
    POIs: Array<POI>;
};

export const initMap = (params: MapParameters) => {
    const { config } = params;
    const {
        poiTracker,
        locationController,
        orientationTracker,
        locationTracker,
    } = params.providers;

    const map = L.map("map", config.mapOptions).setView(
        config.initialLocation,
        config.initialZoom,
    );

    // TODO: this is AI generated. put code elsewhere and study (it works really well)
    /**
     * Smoothly rotates the map toward device heading.
     *
     * Design goals:
     * - Ignore small compass jitter (<5°)
     * - Always rotate via shortest arc (-180 → 180)
     * - Never cancel/restart animations (prevents flashing)
     * - Continuously ease toward latest heading
     * - Invert heading so map rotates opposite device rotation
     *
     * Architecture:
     * - `currentBearing` = live animated value (what map is currently showing)
     * - `targetBearing`  = most recent desired heading
     * - One persistent animation loop that "chases" the target
     */

    let currentBearing: number | undefined;
    let targetBearing: number | undefined;
    let animationFrame: number | undefined;

    orientationTracker.addListener(({ heading }) => {
        // Normalize heading to 0–360
        const normalized = ((heading % 360) + 360) % 360;

        // Invert for map rotation:
        // When user turns left, map should rotate clockwise.
        const corrected = (360 - normalized) % 360;

        // First heading received → initialize map immediately.
        if (currentBearing === undefined) {
            currentBearing = corrected;
            targetBearing = corrected;
            map.setBearing(corrected);
            debug(`[map] initial bearing ${corrected}`);
            return;
        }

        // Compute shortest angular difference (-180 to 180)
        let delta = corrected - currentBearing;
        delta = ((delta + 540) % 360) - 180;

        // Ignore small compass jitter
        if (Math.abs(delta) < 5) {
            debug(`[map] ignored jitter delta=${delta.toFixed(2)}`);
            return;
        }

        // Update target bearing (animation loop will chase it)
        targetBearing = corrected;
        debug(`[map] new target ${targetBearing.toFixed(1)}`);

        // Start animation loop if not already running
        if (animationFrame === undefined) {
            animate();
        }
    });

    /**
     * Animation loop.
     *
     * Runs continuously until currentBearing converges on targetBearing.
     * Uses proportional step easing (spring-like motion).
     */
    function animate() {
        if (currentBearing === undefined || targetBearing === undefined) {
            animationFrame = undefined;
            return;
        }

        // Shortest angular delta
        let delta = targetBearing - currentBearing;
        delta = ((delta + 540) % 360) - 180;

        // Smoothing factor:
        // - Lower (0.1) = softer, floaty
        // - Higher (0.25) = tighter, more responsive
        const smoothing = 0.15;

        // Step toward target
        const step = delta * smoothing;

        // If close enough → snap to final value and stop animating
        if (Math.abs(delta) < 0.3) {
            currentBearing = targetBearing;
            map.setBearing(currentBearing); // TODO: type
            debug(`[map] settled at ${currentBearing.toFixed(1)}`);
            animationFrame = undefined;
            return;
        }

        // Apply step and normalize
        currentBearing = (((currentBearing + step) % 360) + 360) % 360;

        map.setBearing(currentBearing);

        animationFrame = requestAnimationFrame(animate);
    }

    locationTracker.addListener(({ latitude, longitude }) => {
        // TODO: only if the location is within the bounds -- or should that happen higher up?
        map.setView([latitude, longitude], map.getZoom(), {
            animate: true,
        });
    });
    // this conflicts with the polygons. TODO
    //.on("click", () => {
    //    // deselect the active POI when the user clicks outside on the map
    //    //poiTracker.deselectActive();
    //});

    config.defaultLayer.addTo(map);

    debug(`[map] adding additionalLayers: ${params.additionalLayers}`);
    params.additionalLayers?.forEach((layer) => map.addLayer(layer));

    // Force a redraw of the accuracy circle during map movements (especially iOS pinch-zoom).
    map.on("move", locationController.zoomAnimationCallback);

    // add UI widget for holding onto layers
    if (config.tileLayers /* TODO: && buildFlag === "debug" */) {
        L.control.layers(config.tileLayers).addTo(map);
    }

    // TODO: move this into a layer exposed on the POIControlller
    params.POIs.forEach((POI, index) => {
        const { latitude, longitude } = POI.location;

        L.marker([latitude, longitude], {
            icon: poiMarker({ number: index + 1, POI }),
        })
            .addTo(map)
            .on("click", () => {
                poiTracker.select(POI);
            });
    });

    // Safari (macOS/iOS) can change viewport when the location permission dialog
    // appears or closes, so Leaflet’s cached size becomes wrong. Recompute it.
    const recomputeMapSize = () => {
        debug("[map] recomputeMapSize called");
        map.invalidateSize();
    };

    // Fallback: fix size on first user interaction (e.g. first tap/click) in case
    // the permission dialog didn’t fire or viewport settled later (Safari).
    const onFirstInteraction = () => {
        recomputeMapSize();
        map.off("click", onFirstInteraction);
    };
    map.on("click", onFirstInteraction);

    // Safari often resizes viewport after the permission dialog; recalc after a delay.
    const delayedFix = () => {
        recomputeMapSize();
    };
    setTimeout(delayedFix, 400);
    setTimeout(delayedFix, 1200);
};
