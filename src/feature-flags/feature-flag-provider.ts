import { Observable } from "../observable";
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
    constructor(private featureFlags: Record<FeatureFlagKey, FeatureFlagType>) {
        super();
    }

    get(key: FeatureFlagKey): FeatureFlagType {
        return this.featureFlags[key];
    }

    set(key: FeatureFlagKey, value: boolean) {
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
