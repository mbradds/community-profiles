import * as L from "leaflet";
import { setUpHeight } from "./util";
import { addCommunityLayer } from "./addCommunityLayer";
import { addReserveLayer } from "./addReserveLayer";
import { tmAssets } from "./tmAssets";
import { getCommunityData } from "./getCommunityData";
import { oldBrowserError } from "./oldBrowserError";
import { proximity } from "./proximity";
import { BaseMap } from "./mapClasses/BaseMap";
import "leaflet/dist/leaflet.css";
import "../css/main.css";

/**
 * Loads the basemap and all the map layers
 * @param mapHeight height of the map container
 * @param userWidth width of the users screen
 * @param landFeature First Nations Reserve geojson
 * @param landInfo Information on overlaps for each First Nations Reserve
 * @param incidentFeature Information on incidents for each First Nations Reserve
 * @returns leaflet map object
 */
async function loadMap(
  mapHeight: number,
  userWidth: number,
  landFeature: any,
  landInfo: any,
  incidentFeature: any
) {
  const communityData = await getCommunityData();
  const map = new BaseMap("map", {
    zoomDelta: 1,
    zoomSnap: 0.5,
    initZoomLevel: 4,
    initZoomTo: L.latLng([55, -119]),
    attributionControl: false
  });

  map.addResetBtn();

  let popWidth = Math.floor(mapHeight * 0.9);
  const popHeight = Math.floor(popWidth * 0.9);
  if (userWidth < popWidth) {
    popWidth = userWidth - 85;
  }

  const communityLayer = await addCommunityLayer(
    map,
    popHeight,
    popWidth,
    communityData
  );
  communityLayer.electionRangeListener();
  communityLayer.searchCommunities();
  const [tmSpreadLayer, mainlineLayer] = tmAssets(map, communityLayer);
  const reserveLayer = addReserveLayer(
    map,
    landFeature,
    landInfo,
    incidentFeature
  );

  map.addLayerControl([
    { layer: communityLayer.featureGroup, display: "Communities" },
    { layer: tmSpreadLayer, display: "TMX" },
    { layer: mainlineLayer, display: "Existing Mainline" },
    { layer: reserveLayer, display: "First Nations Reserves" },
  ]);

  proximity(map, communityLayer);
  map.addMapLegend(communityLayer);
  map.resetZoom(communityLayer);
  map.resetListener(communityLayer);
  return map;
}

/**
 * Loads non map components (totals, treaty overlaps)
 * @param landFeature
 * @param incidentFeature
 * @param meta
 * @returns
 */
function loadNonMap() {
  const user = setUpHeight();
  return user;
}

/**
 * Loads the main dashboard
 * @param landFeature
 * @param landInfo
 * @param incidentFeature
 * @param meta
 */
export function iamcDashboard(
  landFeature: any,
  landInfo: any,
  incidentFeature: any
) {
  function main() {
    oldBrowserError();
    async function buildPage() {
      const mapDiv = document.getElementById("map");
      const mapHeight = mapDiv ? mapDiv.clientHeight : 700;
      const user = loadNonMap();
      const map = await loadMap(
        mapHeight,
        user,
        landFeature,
        landInfo,
        incidentFeature
      );
      return map;
    }

    buildPage().then(() => {
      Array.from(
        document.getElementsByClassName(
          "loader"
        ) as HTMLCollectionOf<HTMLElement>
      ).forEach((div) => {
        div.style.display = "none";
      });
    });
  }
  main();
}
