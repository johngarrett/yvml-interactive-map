import { debug } from "../utils";

type LocationPoint = {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
};

class LocationStore {
    maybeAdd(point: LocationPoint) {
        // TODO: filtering around what to save based on distance
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
