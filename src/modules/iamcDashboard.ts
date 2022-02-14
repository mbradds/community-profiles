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
import { IamcMap, MapWarning, MapControl } from "./interfaces";
import "leaflet/dist/leaflet.css";
import "../css/main.css";

interface MetaData {
  company: string;
  totalLength: number;
}

/**
 * Sets the summary statistics above the map
 * @param landFeature First Nations Reserve geojson
 * @param incidentFeature Corresponding incident info for each reserve
 * @param meta Company name and total reserve overlap length
 */
function dashboardTotals(
  landFeature: any,
  incidentFeature: any,
  meta: MetaData
) {
  const addStyle = (val: number | string) => `<strong>${val}</strong>`;
  const flagClass = (val: number) =>
    val > 0 ? "alert alert-danger" : "alert alert-success";

  const lengthInfo = lengthUnits(meta.totalLength);
  const htmlLiOver = `Approximately ${addStyle(lengthInfo[0])} ${
    lengthInfo[1]
  } of regulated pipeline passes directly through ${addStyle(
    landFeature.features.length
  )} First Nations ${plural(landFeature.features.length, "reserve", true)}.`;

  const incidentMeta = incidentFeature.meta;
  const htmlLiIncOn = `<div class="${flagClass(
    incidentMeta.on
  )}"><p>There has been ${addStyle(incidentMeta.on)} reported system ${plural(
    incidentMeta.on,
    "incident",
    false
  )} directly on First Nations Reserves.</p></div>`;

  const htmlLiIncOff = `<div class="${flagClass(
    incidentMeta["15km"]
  )}"><p>There has been ${addStyle(
    incidentMeta["15km"]
  )} reported system ${plural(
    incidentMeta["15km"],
    "incident",
    false
  )} within 15 km of First Nations Reserves.</p></div>`;

  const overlapElement = document.getElementById("overlap-meta-point");
  const incidentsOnElement = document.getElementById("incident-meta-point-on");
  const incidentsNearElement = document.getElementById(
    "incident-meta-point-off"
  );
  if (overlapElement) {
    overlapElement.innerHTML = htmlLiOver;
  }
  if (incidentsOnElement) {
    incidentsOnElement.innerHTML = htmlLiIncOn;
  }
  if (incidentsNearElement) {
    incidentsNearElement.innerHTML = htmlLiIncOff;
  }
}

/**
 * Adds a leaflet control object for the "Reset Map" button
 * @param map leaflet map object
 */
function addResetBtn(map: IamcMap) {
  const info: MapControl = new L.Control({ position: "bottomleft" });
  info.onAdd = function () {
    this._div = L.DomUtil.create("div");
    this._div.innerHTML = `<button type="button" id="find-me" class="btn btn-primary btn-block btn-lg">Find Me</button><button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg">Reset Map</button>`;
    return this._div;
  };
  info.addTo(map);
}

/**
 * Adds a leaflet map control to the bottom right corner
 * @param map leaflet map object
 */
function mapWarning(map: IamcMap) {
  const info: MapWarning = new L.Control({ position: "bottomright" });
  info.setPosition("bottomright");
  info.onAdd = function onAdd() {
    this._div = L.DomUtil.create("div");
    this._div.innerHTML = ``;
    return this._div;
  };
  info.addWarning = function addWarning(text: string) {
    this._div.innerHTML = `<div class="alert alert-danger"><span class="h3 mrgn-bttm-0">${text}</span></div>`;
  };
  info.removeWarning = function removeWarning() {
    this._div.innerHTML = "";
  };
  info.addTo(map);
  map.warningMsg = info;
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
      { layer: communityLayer, display: "Communities" },
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
function loadNonMap(landFeature: any, incidentFeature: any, meta: MetaData) {
  dashboardTotals(landFeature, incidentFeature, meta);
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
      const mapHeight = document.getElementById("map").clientHeight;
      const user = loadNonMap(landFeature, incidentFeature, meta);
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
