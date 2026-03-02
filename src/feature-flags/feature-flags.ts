import type { FeatureFlagType } from "./types";

export const deafaultFeatureFlags = {
    polygons: {
        name: "polygons",
        description: "Enable polygon drawing tools",
        value: true,
    },
} as const satisfies Record<string, FeatureFlagType>;
