import { mapLayers } from "./map/layers";
import { initMap } from "./map/map";
import { POIs } from "./points";

import "./styles.css";

initMap({
    POIs,
    initialLocation: [34.181983, -116.414443],
    initialZoom: 19,
    defaultLayer: mapLayers.satellite,
    layers: mapLayers,
});
