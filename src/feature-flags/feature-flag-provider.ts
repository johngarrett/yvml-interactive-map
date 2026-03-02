import { Observable } from "../observable";
import { debug } from "../utils";
import { deafaultFeatureFlags } from "./feature-flags";
import {
    type FeatureFlags,
    type FeatureFlagType,
    type FeatureFlagKey,
} from "./types";

type NotificationType = {
    key: FeatureFlagKey;
    value: boolean;
};

export class FeatureFlagProvider extends Observable<NotificationType> {
    constructor(
        public readonly featureFlags: Record<FeatureFlagKey, FeatureFlagType>,
    ) {
        super();
    }

    get(key: FeatureFlagKey): FeatureFlagType {
        return this.featureFlags[key];
    }

    set(key: FeatureFlagKey, value: boolean) {
        debug(`setting ${key} to ${value}`);
        this.featureFlags[key].value = value;

        this.notify({
            key,
            value,
        });
    }
}

let featureFlagProvider: FeatureFlagProvider | undefined = undefined;

export const initFeatureFlagProvider = (
    featureFlags?: Partial<FeatureFlags>,
) => {
    featureFlagProvider = new FeatureFlagProvider({
        ...deafaultFeatureFlags,
        ...featureFlags,
    });
};

export const getFeatureFlagProviderOrThrow = () => {
    if (!featureFlagProvider) {
        throw Error("missing feature flag provider");
    }
    return featureFlagProvider;
};
