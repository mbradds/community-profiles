import * as L from "leaflet";
import {
  leafletBaseMap,
  lengthUnits,
  setUpHeight,
  mapLegend,
  resetZoom,
  resetListener,
  plural,
} from "./util";
import { addCommunityLayer } from "./addCommunityLayer";
import { addReserveLayer } from "./addReserveLayer";
import { tmAssets } from "./tmAssets";
import { getCommunityData } from "./getCommunityData";
import { oldBrowserError } from "./oldBrowserError";
import { proximity } from "./proximity";
import { HtmlControl } from "./mapClasses/MapControl";
import { IamcMap } from "./interfaces";
import "leaflet/dist/leaflet.css";
import "../css/main.css";

interface MetaData {
  company: string;
  totalLength: number;
}

/**
 * Adds a leaflet control object for the "Reset Map" button
 * @param map leaflet map object
 */
function addResetBtn(map: IamcMap) {
  return new HtmlControl(
    "bottomleft",
    map,
    `<button type="button" id="find-me" class="btn btn-primary btn-block btn-lg">Find Me</button><button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg">Reset Map</button>`
  );
}

/**
 * Adds a leaflet map control to the bottom right corner
 * @param map leaflet map object
 */
function mapWarning(map: IamcMap) {
  map.warningMsg = new HtmlControl("bottomright", map);
}

/**
 * Adds a layer control filter to the map
 * @param layers list of all the map layers to be added to the filter
 * @param map leaflet map object
 */
function addLayerControl(
  layers: { display: string; layer: L.Layer }[],
  map: IamcMap
) {
  const layerControl: { [key: string]: L.Layer } = {};
  layers.forEach((layer) => {
    layerControl[layer.display] = layer.layer;
  });
  L.control.layers(undefined, layerControl, { position: "topleft" }).addTo(map);
}

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
  const map = leafletBaseMap({
    div: "map",
    zoomDelta: 0.25,
    initZoomLevel: 4,
    initZoomTo: [55, -119],
  });

  mapWarning(map);
  addResetBtn(map);

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

  addLayerControl(
    [
      { layer: communityLayer.featureGroup, display: "Communities" },
      { layer: tmSpreadLayer, display: "TMX" },
      { layer: mainlineLayer, display: "Existing Mainline" },
      { layer: reserveLayer, display: "First Nations Reserves" },
    ],
    map
  );

  proximity(map, communityLayer);
  mapLegend(map, communityLayer);
  resetZoom(map, reserveLayer, communityLayer);
  resetListener(map, reserveLayer, communityLayer);
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
  incidentFeature: any,
  meta: MetaData
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
