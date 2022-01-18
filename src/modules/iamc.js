import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import pointInPolygon from "point-in-polygon";
import {
  leafletBaseMap,
  lengthUnits,
  setTitle,
  setUpHeight,
  addpoly2Length,
  reservePopUp,
  mapLegend,
  resetZoom,
  reserveTooltip,
  resetListener,
  plural,
  featureStyles,
  findUser,
} from "./util.js";
import { addCommunityLayer } from "./communityPopUp.js";
import { spread } from "./spreads.js";
import territoryPolygons from "../company_data/community_profiles/indigenousTerritoriesCa.json";

import "leaflet/dist/leaflet.css";
import "../css/iamc.css";
import "../css/main.css";

export function landDashboard(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  meta,
  line = false
) {
  function dashboardTotals() {
    const addStyle = (val) => `<strong>${val}</strong>`;
    const flagClass = (val) =>
      val > 0 ? "alert alert-danger" : "alert alert-success";

    let totalFeatures = 0;
    landFeature.features.forEach(() => {
      totalFeatures += 1;
    });
    const lengthInfo = lengthUnits(meta.totalLength);
    const htmlLiOver = `Approximately ${addStyle(lengthInfo[0])} ${
      lengthInfo[1]
    } of regulated pipeline passes directly through ${addStyle(
      totalFeatures
    )} First Nations ${plural(totalFeatures, "reserve", true)}.`;
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

  function addResetBtn(map) {
    const info = L.control({ position: "bottomleft" });
    info.onAdd = function () {
      this._div = L.DomUtil.create("div");
      this._div.innerHTML = `<button type="button" id="find-me" class="btn btn-primary btn-block btn-lg">Find Me</button><button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg">Reset Map</button>`;
      return this._div;
    };
    info.addTo(map);
  }

  function onLand(map, polygons) {
    const nearbyStuff = (mapWithUser) => {
      const youAreOn = [];
      // look for user inside matched (on map) polygons
      if (polygons) {
        Object.values(polygons._layers).forEach((polygon) => {
          const inside = pointInPolygon(
            [mapWithUser.user.lng, mapWithUser.user.lat],
            polygon.feature.geometry.coordinates[0]
          );
          if (inside) {
            youAreOn.push(polygon.feature.properties);
          }
        });
      }
      // look for user in unmatched (hidden) polygons
      territoryPolygons.features.forEach((polygon) => {
        const inside = pointInPolygon(
          [mapWithUser.user.lng, mapWithUser.user.lat],
          polygon.geometry.coordinates[0]
        );
        if (inside) {
          youAreOn.push(polygon.properties);
        }
      });
      mapWithUser.panTo(mapWithUser.user);
      let youAreOnTable = "<ul>";
      youAreOn.forEach((land) => {
        youAreOnTable += `<li><a href="${land.description}" target="_blank">${land.Name}</a></li>`;
      });
      youAreOnTable += "</ul>";
      mapWithUser.youAreOn.updateHtml(
        `<section class="panel panel-warning">
        <header class="panel-heading">
         <h5 class="panel-title header-text">You are on ${youAreOn.length} Traditional Territories</h5>
         <div class="pull-right header-btn">
         <button
           type="button"
           class="btn btn-primary btn-xs"
           id="close-you-are-on"
         >
         Close
         </button>
       </div>
        </header>
        <div class="panel-body">
         ${youAreOnTable}
         <p style="margin-bottom:0px;">Move the blue marker to a new area and click <i>Find Me</i> again to view other locations.</p>
        </div>
      </section>`
      );
      document
        .getElementById("close-you-are-on")
        .addEventListener("click", () => {
          map.youAreOn.removeHtml();
        });
    };

    // div for displaying territories you are on
    const info = L.control({ position: "bottomright" });
    info.onAdd = function () {
      this._div = L.DomUtil.create("div");
      this._div.innerHTML = ``;
      return this._div;
    };
    info.updateHtml = function (html) {
      this._div.innerHTML = html;
    };
    info.removeHtml = function () {
      this._div.innerHTML = "";
    };
    info.addTo(map);
    map.youAreOn = info;

    document.getElementById("find-me").addEventListener("click", () => {
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

  function loadMap(mapHeight, user) {
    const layerControl = { single: {}, multi: {} };
    const map = leafletBaseMap({
      div: "map",
      zoomDelta: 0.25,
      initZoomLevel: 4,
      initZoomTo: [55, -119],
    });

    mapWarning(map);
    addResetBtn(map);

    if (line) {
      L.geoJSON(line, {
        style: featureStyles.tmx,
      }).addTo(map);
    }

    let popWidth = Math.floor(mapHeight * 0.9);
    const popHeight = Math.floor(popWidth * 0.9);
    if (user[1] < popWidth) {
      popWidth = user[1] - 85;
    }

    let communityLayer = false;
    if (meta.company === "Trans Mountain Pipeline ULC") {
      communityLayer = addCommunityLayer(map, popHeight, popWidth);
      layerControl.multi.Communities = communityLayer;
      spread(map, communityLayer);
      communityLayer.electionRangeListener();
    }

    const geoLayer = L.geoJSON(landFeature, {
      style: featureStyles.reserveOverlap,
      landInfo,
      incidentFeature,
    })
      .bindTooltip((layer) =>
        reserveTooltip(layer.feature.properties, landInfo)
      )
      .bindPopup((layer) => reservePopUp(layer))
      .addTo(map);

    layerControl.multi["First Nations Reserves"] = geoLayer;

    onLand(map, false);
    mapLegend(map, communityLayer);
    resetZoom(map, geoLayer, communityLayer);
    resetListener(map, geoLayer, communityLayer);
    L.control
      .layers(layerControl.single, layerControl.multi, { position: "topleft" })
      .addTo(map);
    return map;
  }

  function loadNonMap() {
    setTitle(meta.company);
    addpoly2Length(poly2Length, meta.company);
    dashboardTotals();
    const user = setUpHeight();
    return user;
  }

  function main() {
    async function buildPage() {
      const mapHeight = document.getElementById("map").clientHeight;
      const user = loadNonMap();
      const map = await loadMap(mapHeight, user);
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
