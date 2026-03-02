import type { FeatureFlagType } from "./types";

export const deafaultFeatureFlags = {
    polygons: {
        name: "polygons",
        description: "Enable polygon shapes around buildings",
        value: false,
    },
} as const satisfies Record<string, FeatureFlagType>;
