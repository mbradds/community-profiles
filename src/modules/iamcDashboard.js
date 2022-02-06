import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import pointInPolygon from "point-in-polygon";
import {
  leafletBaseMap,
  lengthUnits,
  setUpHeight,
  mapLegend,
  resetZoom,
  resetListener,
  plural,
  findUser,
  addCustomControl,
  ifIEShowError,
} from "./util.js";
import { addCommunityLayer } from "./addCommunityLayer.js";
import { addReserveLayer } from "./addReserveLayer.js";
import { tmAssets } from "./tmAssets.js";
import { getCommunityData } from "./getCommunityData.js";
import territoryPolygons from "../company_data/community_profiles/indigenousTerritoriesCa.json";
import "leaflet/dist/leaflet.css";
import "../css/main.css";

/**
 * Sets the summary statistics above the map
 * @param {Object} landFeature First Nations Reserve geojson
 * @param {Object} incidentFeature Corresponding incident info for each reserve
 * @param {Object} meta Company name and total reserve overlap length
 */
function dashboardTotals(landFeature, incidentFeature, meta) {
  const addStyle = (val) => `<strong>${val}</strong>`;
  const flagClass = (val) =>
    val > 0 ? "alert alert-danger" : "alert alert-success";

  const lengthInfo = lengthUnits(meta.totalLength);
  const htmlLiOver = `Approximately ${addStyle(lengthInfo[0])} ${
    lengthInfo[1]
  } of regulated pipeline passes directly through ${addStyle(
    landFeature.features.length
  )} First Nations ${plural(landFeature.features.length, "reserve", true)}.`;
  document.getElementById("overlap-meta-point").innerHTML = htmlLiOver;

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

  document.getElementById("incident-meta-point-on").innerHTML = htmlLiIncOn;
  document.getElementById("incident-meta-point-off").innerHTML = htmlLiIncOff;
}

/**
 * Adds a leaflet control object for the "Reset Map" button
 * @param {Object} map leaflet map object
 */
function addResetBtn(map) {
  const info = L.control({ position: "bottomleft" });
  info.onAdd = function () {
    this._div = L.DomUtil.create("div");
    this._div.innerHTML = `<button type="button" id="find-me" class="btn btn-primary btn-block btn-lg">Find Me</button><button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg">Reset Map</button>`;
    return this._div;
  };
  info.addTo(map);
}

/**
 * Evaluates the users location against the traditional territory polygons.
 * TODO: extend this function to find communities near the user.
 * @param {Object} map leaflet map object
 */
function nearbyStuff(map) {
  const onTerritories = [];
  territoryPolygons.features.forEach((polygon) => {
    const inside = pointInPolygon(
      [map.user.lng, map.user.lat],
      polygon.geometry.coordinates[0]
    );
    if (inside) {
      onTerritories.push(polygon.properties);
    }
  });
  map.panTo(map.user);
  let youAreOnTable = "<ul>";
  onTerritories.forEach((land) => {
    youAreOnTable += `<li><a href="${land.description}" target="_blank">${land.Name}</a></li>`;
  });
  youAreOnTable += "</ul>";
  map.youAreOn.addSection(
    "ur-on",
    "close-you-are-on",
    `You are on ${onTerritories.length} Traditional Territories`,
    youAreOnTable,
    "Move the blue marker to a new area and click <i>Find Me</i> again to view other locations."
  );
  map.youAreOn.fixScroll("ur-on");
  map.youAreOn.closeBtnListener("close-you-are-on");
}

/**
 * Evaluates the users location against traditional territory's
 * @param {Object} map leaflet map object
 */
function onLand(map, communityLayer) {
  map.youAreOn = addCustomControl("bottomright", map);
  document.getElementById("find-me").addEventListener("click", () => {
    communityLayer.contactControl.updateHtml("");
    if (!map.user) {
      findUser(map)
        .then(() => {
          // check polygons for user
          nearbyStuff(map);
        })
        .catch(() => {
          map.youAreOn.updateHtml(
            `<div class="alert alert-danger"><h3 style="margin-bottom:0;">Cant access your location. Try enabling location services and refresh the page.</h3></div>`
          );
        });
    } else {
      // check polygons for user
      nearbyStuff(map);
    }
  });
}

/**
 * Adds a leaflet map control to the bottom right corner
 * @param {Object} map leaflet map object
 */
function mapWarning(map) {
  const info = L.control({ position: "bottomright" });
  info.onAdd = function () {
    this._div = L.DomUtil.create("div");
    this._div.innerHTML = ``;
    return this._div;
  };
  info.addWarning = function (text) {
    this._div.innerHTML = `<div class="alert alert-danger"><span class="h3 mrgn-bttm-0">${text}</span></div>`;
  };
  info.removeWarning = function () {
    this._div.innerHTML = "";
  };
  info.addTo(map);
  map.warningMsg = info;
}

/**
 * Adds a layer control filter to the map
 * @param {Object[]} layers list of all the map layers to be added to the filter
 * @param {Object} map leaflet map object
 */
function addLayerControl(layers, map) {
  const layerControl = { single: {}, multi: {} };
  layers.forEach((layer) => {
    layerControl.multi[layer.display] = layer.layer;
  });
  L.control
    .layers(layerControl.single, layerControl.multi, { position: "topleft" })
    .addTo(map);
}

/**
 * Loads the basemap and all the map layers
 * @param {number} mapHeight height of the map container
 * @param {number} userWidth width of the users screen
 * @param {Object} landFeature First Nations Reserve geojson
 * @param {Object} landInfo Information on overlaps for each First Nations Reserve
 * @param {Object} incidentFeature Information on incidents for each First Nations Reserve
 * @returns {Object} leaflet map object
 */
async function loadMap(
  mapHeight,
  userWidth,
  landFeature,
  landInfo,
  incidentFeature
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

  onLand(map, communityLayer);
  mapLegend(map, communityLayer);
  resetZoom(map, reserveLayer, communityLayer);
  resetListener(map, reserveLayer, communityLayer);
  return map;
}

/**
 * Loads non map components (totals, treaty overlaps)
 * @param {*} landFeature
 * @param {*} incidentFeature
 * @param {*} meta
 * @returns
 */
function loadNonMap(landFeature, incidentFeature, meta) {
  dashboardTotals(landFeature, incidentFeature, meta);
  const user = setUpHeight();
  return user;
}

/**
 * Loads the main dashboard
 * @param {*} landFeature
 * @param {*} landInfo
 * @param {*} incidentFeature
 * @param {*} meta
 */
export function iamcDashboard(
  landFeature,
  landInfo,
  incidentFeature,
  meta
) {
  function main() {
    ifIEShowError();
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
      Array.from(document.getElementsByClassName("loader")).forEach((div) => {
        const divToHide = div;
        divToHide.style.display = "none";
      });
    });
  }
  main();
}
