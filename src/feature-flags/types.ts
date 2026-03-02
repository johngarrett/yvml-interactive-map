import type { deafaultFeatureFlags } from "./feature-flags";

export type FeatureFlagType = {
    name: string;
    description: string;
    value: boolean;
};

export type FeatureFlags = typeof deafaultFeatureFlags;
export type FeatureFlagKey = keyof FeatureFlags;
