import { initMap } from "./map/map";
import { POIs } from "./map/POIs";

initMap({
    POIs,
    initialLocation: [34.181983, -116.414443],
    initialZoom: 19,
});
