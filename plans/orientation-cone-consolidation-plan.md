# Consolidate Orientation Pipeline + Add User Cone

## Summary
Move orientation normalization, jitter suppression, and smoothing out of `rotate-map` into `OrientationTracker`, so all orientation consumers get one stable heading stream. Then use that same heading in `LocationController` to render/update a directional cone around the user location.

## API Changes
1. `OrientationTracker` continues emitting `{ heading }`, now normalized, filtered, and smoothed.
2. `rotateMap` becomes a thin adapter from `heading` to map bearing.
3. `LocationController` adds a directional cone polygon to its `layer`.

## Implementation Steps
1. Refactor `src/location/orientation-tracker.ts`
   - Keep sensor-source detection (`alpha` absolute / `webkitCompassHeading`).
   - Normalize heading to `0..360`.
   - Ignore jitter under `5°`.
   - Move smoothing loop from map module into tracker (`0.15` smoothing, `0.3°` settle).
   - Cancel RAF in `stopOrientationTracking()`.

2. Simplify `src/map/rotate-map.ts`
   - Remove local smoothing/jitter/current-target state.
   - Convert tracker heading to map bearing with `(360 - heading) % 360`.
   - Call `setBearing` directly.

3. Implement cone in `src/location/location-controller.ts`
   - Add latest location + heading state.
   - Add `orientationCone?: L.Polygon` state.
   - Build cone polygon from center, heading, `25m` radius, `90°` spread.
   - Update cone on both location and heading events.
   - Add cone redraw in `zoomAnimationCallback`.

## Test Scenarios
1. Jitter under `5°` does not produce visible movement.
2. Large heading changes animate smoothly and settle.
3. 359° -> 1° follows shortest path.
4. Cone appears only after both location and heading are available.
5. Cone and map rotate consistently.
6. `stopOrientationTracking()` removes listeners and stops RAF.

## Assumptions
1. Keep normalized-heading-only API from tracker.
2. Smoothing ownership is in tracker.
3. Cone defaults to `90°` spread and `25m` radius.
4. No new dependencies; use Leaflet polygon geometry.
