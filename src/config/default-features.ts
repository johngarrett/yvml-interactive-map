import type { FeatureConfig } from "./types";

export const defaultFeatures = {
    polygons: {
        name: "polygons",
        description: "Enable polygon shapes around buildings",
        value: false,
    },
    console: {
        name: "console",
        description: "Enable debug console",
        value: false,
    },
    locationFollowAndRotate: {
        name: "locationFollowAndRotate",
        description:
            "Follow user location and rotate map by orientation (disable to keep map static while dot/cone still move)",
        value: true,
    },
} as const satisfies Record<string, FeatureConfig>;
