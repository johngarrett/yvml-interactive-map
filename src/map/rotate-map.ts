import type { OrientationTracker } from "../location";
import { debug } from "../utils";

type RotateMapParams = {
    orientationTracker: OrientationTracker;
    setBearing: (bearing: number) => void;
};

export const rotateMap = ({
    orientationTracker,
    setBearing,
}: RotateMapParams) => {
    let currentBearing: number | undefined;
    let targetBearing: number | undefined;
    let animationFrame: number | undefined;

    orientationTracker.addListener(({ heading }) => {
        // Normalize heading to 0-360.
        const normalized = ((heading % 360) + 360) % 360;

        // Invert for map rotation:
        // when user turns left, map should rotate clockwise.
        const corrected = (360 - normalized) % 360;

        // First heading received -> initialize map immediately.
        if (currentBearing === undefined) {
            currentBearing = corrected;
            targetBearing = corrected;
            setBearing(corrected);
            debug(`[map] initial bearing ${corrected}`);
            return;
        }

        // Compute shortest angular difference (-180 to 180).
        let delta = corrected - currentBearing;
        delta = ((delta + 540) % 360) - 180;

        // Ignore small compass jitter.
        if (Math.abs(delta) < 5) {
            debug(`[map] ignored jitter delta=${delta.toFixed(2)}`);
            return;
        }

        // Update target bearing (animation loop will chase it).
        targetBearing = corrected;
        debug(`[map] new target ${targetBearing.toFixed(1)}`);

        // Start animation loop if not already running.
        if (animationFrame === undefined) {
            animate();
        }
    });

    const animate = () => {
        if (currentBearing === undefined || targetBearing === undefined) {
            animationFrame = undefined;
            return;
        }

        // Shortest angular delta.
        let delta = targetBearing - currentBearing;
        delta = ((delta + 540) % 360) - 180;

        // Lower is softer, higher is more responsive.
        const smoothing = 0.15;
        const step = delta * smoothing;

        // If close enough, snap and stop animating.
        if (Math.abs(delta) < 0.3) {
            currentBearing = targetBearing;
            setBearing(currentBearing);
            debug(`[map] settled at ${currentBearing.toFixed(1)}`);
            animationFrame = undefined;
            return;
        }

        // Apply step and normalize.
        currentBearing = (((currentBearing + step) % 360) + 360) % 360;
        setBearing(currentBearing);
        animationFrame = requestAnimationFrame(animate);
    };
};
