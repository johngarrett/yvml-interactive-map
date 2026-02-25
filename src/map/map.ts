import type { POI } from "../types";
import L, { TileLayer, type MapOptions } from "leaflet";
import { poiMarker } from "./components/poi-marker";
import { poiTrackerInstance } from "../points";
import { debug, info, warn } from "../utils";
import { locationStoreInstance } from "../location/location-store";

type MapConfiguartion = {
    POIs: Array<POI>;
    initialLocation: [number, number];
    initialZoom: number;
    defaultLayer: TileLayer;
    layers?: Record<string, TileLayer>;
};

export const initMap = (config: MapConfiguartion) => {
    const map = L.map(
        "map",
        {
            rotate: true,
            bearing: 180, // start upside down
            touchRotate: true,
            rotateControl: undefined,
        } as unknown as MapOptions /* these come from the extension */,
    )
        .setView(config.initialLocation, config.initialZoom)
        .on("click", () => {
            // deselect the active POI when the user clicks outside on the map
            poiTrackerInstance.deselectActive();
        });

    config.defaultLayer.addTo(map);

    // TODO: orient map vertically

    if (config.layers /* TODO: && buildFlag === "debug" */) {
        L.control.layers(config.layers).addTo(map);
    }

    config.POIs.forEach((POI, index) => {
        const { lattitude, longitude } = POI.location;

        L.marker([lattitude, longitude], {
            icon: poiMarker({ number: index + 1, POI }),
        })
            .addTo(map)
            .on("click", () => {
                poiTrackerInstance.select(POI);
            });
    });

    // TODO: move this into its own file

    let watchId: number | undefined = undefined;
    // TODO: handle permission denied

    function startTracking() {
        if (watchId !== undefined) {
            warn(
                "[LocationTracking] watchId non-null, startTracking returning early",
            );
            return;
        }

        watchId = navigator.geolocation.watchPosition(
            handlePosition,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 2000, // TODO: see what this does
            },
        );
        info(`[LocationTracking] startTracking began -- ${watchId}`);
    }

    function stopTracking() {
        if (watchId !== undefined) {
            navigator.geolocation.clearWatch(watchId);
            watchId = undefined;
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopTracking();
        } else {
            startTracking();
        }
    });

    let pathLine: L.Polyline | undefined = undefined;
    let marker: L.CircleMarker | undefined = undefined;

    function handlePosition(position: GeolocationPosition) {
        const { latitude, longitude, accuracy } = position.coords;

        if (!pathLine) {
            pathLine = L.polyline([], {
                color: "blue",
                weight: 4,
                smoothFactor: 1.5,
            }).addTo(map);
            // TODO: read from local storage
            pathLine.setLatLngs([[latitude, longitude]]);
        } else {
            pathLine?.addLatLng([latitude, longitude]);
        }

        if (!marker) {
            marker = L.circle([latitude, longitude], {
                radius: accuracy, // meters
                color: "#1e90ff",
                weight: 1,
                fillColor: "#1e90ff",
                fillOpacity: 0.15,
            }).addTo(map);
        } else {
            marker.setLatLng([latitude, longitude]);
            marker.setRadius(accuracy);
        }

        locationStoreInstance.maybeAdd({
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
        });
    }

    function handleError(error: GeolocationPositionError) {
        switch (error.code) {
            case GeolocationPositionError.PERMISSION_DENIED: {
                info("permission denined");
                break;
            }
            case GeolocationPositionError.POSITION_UNAVAILABLE: {
                info("position unavailable");
                break;
            }
            case GeolocationPositionError.TIMEOUT: {
                info("timeout");
                break;
            }
        }
        info(error);
    }

    startTracking();

    // Safari (macOS/iOS) can change viewport when the location permission dialog
    // appears or closes, so Leaflet’s cached size becomes wrong. Recompute it.
    const recomputeMapSize = () => {
        debug("[map] recomputeMapSize called");
        map.invalidateSize();
    };

    //map.locate({
    //    /* watch: true */
    //    // enableHighAccuracy ?
    //});

    //map.on("locationerror", (e) => {
    //    console.error(e);
    //    recomputeMapSize();
    //});
    //map.on("locationfound", (e) => {
    //    // TODO: remove previous circle, get orientation
    //    const radius = e.accuracy;

    //    L.circle(e.latlng, { radius }).addTo(map);
    //    // TODO: on first locationfound, should we center and recompute?

    //    const [latitude, longitude] = [e.latlng.lat, e.latlng.lng];

    //    locationStoreInstance.maybeAdd({
    //        latitude: latitude,
    //        longitude: longitude,
    //        accuracy: e.accuracy,
    //        timestamp: Date.now(),
    //    });
    //    //recomputeMapSize();
    //});

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
