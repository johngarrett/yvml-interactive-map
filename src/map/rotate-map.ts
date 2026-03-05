import type { OrientationTracker } from "../location";

type RotateMapParams = {
    orientationTracker: OrientationTracker;
    setBearing: (bearing: number) => void;
};

export const rotateMap = ({
    orientationTracker,
    setBearing,
}: RotateMapParams) => {
    orientationTracker.addListener(({ heading }) => {
        // Invert for map rotation:
        // when user turns left, map should rotate clockwise.
        const corrected = (360 - heading) % 360;
        setBearing(corrected);
    });
};
