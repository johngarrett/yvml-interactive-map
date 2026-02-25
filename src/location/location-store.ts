import { debug } from "../utils";
import L from "leaflet";

type LocationPoint = {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
};

class LocationStore {
    maybeAdd(point: LocationPoint) {
        const previousPoint = this.data[this.data.length - 1];

        if (previousPoint) {
            let current = L.latLng(point.latitude, point.longitude);
            let previous = L.latLng(
                previousPoint?.latitude,
                previousPoint?.longitude,
            );

            let distanceInMeters = current.distanceTo(previous);

            debug(
                `[LocationStore] distance between ${current} and ${previous} = ${distanceInMeters}`,
            );

            if (distanceInMeters < 1) {
                // less than 1 meter
                debug(
                    `[LocationStore] distance not great enough, returning early.`,
                );
                return;
            }
        }

        this.data.push(point);
        debug(
            `[LocationStore]: ${point} added; total size: ${this.data.length}`,
        );
    }

    getAll(): Array<LocationPoint> {
        debug(`[LocationStore]: getAll: ${this.data}`);
        return this.data;
    }

    private data: Array<LocationPoint> = []; // TODO: set?
}

export const locationStoreInstance = new LocationStore();
