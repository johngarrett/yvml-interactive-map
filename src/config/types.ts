import type { defaultFeatures } from "./default-features";

export type FeatureConfig = {
    name: string;
    description: string;
    value: boolean;
};

export type FeaturesConfig = typeof defaultFeatures;
export type FeatureKey = keyof FeaturesConfig;

export type Config = {
    features: Record<FeatureKey, FeatureConfig>;
} & Record<string, unknown>;

export type FeatureUpdateEvent = {
    key: "features";
    value: {
        key: FeatureKey;
        value: boolean;
    };
};

export type RootUpdateEvent = {
    key: Exclude<string, "features">;
    value: unknown;
};

export type ConfigEvent = FeatureUpdateEvent | RootUpdateEvent;
