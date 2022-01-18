import "core-js/modules/es.promise.js";
import * as L from "leaflet";
import {
  cerPalette,
  leafletBaseMap,
  setLeafletHeight,
  lengthUnits,
  setTitle,
  setUpHeight,
  addpoly2Length,
  onEachFeature,
  mapLegend,
  resetZoom,
  reserveTooltipSimple,
  resetListener,
  plural,
  featureStyles,
  clickExtraInfo,
} from "./util.js";
import "leaflet/dist/leaflet.css";
import "../css/main.css";
import "../css/pipeline-profiles.css";

export function profile(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  terr,
  meta,
  line = false
) {
  const build = meta.totalLength > 0;
  const addStyle = (val) =>
    `<span class="bg-primary"><strong>&nbsp;${val}&nbsp;</strong></span>`;
  function addTraditionalTerritory() {
    const terrTotal = terr.length;
    let terrTables = ``;
    const listColumn = (terrSlice) => {
      let terrLinks = `<div class="col-md-6"> <ul>`;
      terrSlice.forEach((t) => {
        terrLinks += `<li><a href="${t.description}" target="_blank">${t.Name}</a></li>`;
      });
      terrLinks += `</ul></div>`;
      return terrLinks;
    };
    terrTables += listColumn(terr.slice(0, Math.ceil(terrTotal / 2)));
    terrTables += listColumn(terr.slice(Math.ceil(terr.length / 2)));
    document.getElementById("territory-intro").innerHTML = `<p>${
      build
        ? "In addition to the First Nations Reserves above, "
        : "This pipeline system does not directly pass through any First Nations Reserves. "
    }This pipeline system passes through an estimated ${addStyle(
      terrTotal
    )} Indigenous Traditional Territories, which are listed in alphabetical order below. This list may not be comprehensive, and will continue to be updated as new data and feedback is recieved.</p>`;
    document.getElementById(
      "territory-title"
    ).innerText = `${meta.company} & Indigenous Traditional Territory`;
    document.getElementById("territory-panel").innerHTML = `${terrTables}`;
  }

  function showIamc() {
    const flag = (info) => `<section class="alert alert-info">
      <h3>${info.project} Indigenous Advisory and Monitoring Committee (IAMC)</h3>
      <p>The ${info.project} project has a dedicated IAMC. The IAMC operates independently to increase Indigenous involvement in the federal monitoring and oversight in the ${info.project} project.</p>
      <p>For more information, visit their website (external links English only):</p>
      <ul>
      <li>${info.linkText}<a href="${info.link}">&nbsp;${info.link}</a></li>
      </ul>
      </section>`;

    const info = {};
    if (meta.company === "Trans Mountain Pipeline ULC") {
      info.project = "TMX";
      info.linkText = "TMX Indigenous Advisory and Monitoring Committee";
      info.link = "https://iamc-tmx.com/";
      document.getElementById("iamc-flag").innerHTML = flag(info);
      return true;
    }
    if (meta.company === "Enbridge Pipelines Inc.") {
      info.project = "Line 3";
      info.linkText = "Line 3 Indigenous Advisory and Monitoring Committee";
      info.link = "http://iamc-line3.com/";
      document.getElementById("iamc-flag").innerHTML = flag(info);
      return true;
    }
    return false;
  }

  function dynamicText(textData) {
    let totalFeatures = 0;
    landFeature.features.forEach(() => {
      totalFeatures += 1;
    });
    const lengthInfo = lengthUnits(textData.totalLength);
    let text = `<p>On this system, approximately ${addStyle(lengthInfo[0])} ${
      lengthInfo[1]
    } of regulated pipeline passes directly through ${addStyle(
      totalFeatures
    )} First Nations ${plural(totalFeatures, "reserve", true)}. `;

    const incidentMeta = incidentFeature.meta;

    text += `There has been ${addStyle(
      incidentMeta.on
    )} reported system ${plural(
      incidentMeta.on,
      "incident",
      false
    )} directly on First Nations Reserves. There has been ${addStyle(
      incidentMeta["15km"]
    )} reported system ${plural(
      incidentMeta["15km"],
      "incident",
      false
    )} within 15 km of First Nations Reserves. Take a look at the map below for more information about these overlaps.</p>`;

    document.getElementById("indigenous-dynamic-text").innerHTML = text;
  }

  function loadMap() {
    const dashboardClass = document.getElementById("reserve-dashboard");
    if (build) {
      dynamicText(meta);
      dashboardClass.classList.add("mrgn-tp-md");
      dashboardClass.classList.add("mrgn-bttm-lg");
      const map = leafletBaseMap({
        div: "map",
        zoomDelta: 0.25,
        initZoomLevel: 4,
        initZoomTo: [55, -119],
      });

      const geoLayer = L.geoJSON(landFeature, {
        style: featureStyles.reserveOverlap,
        landInfo,
        incidentFeature,
        pipelineProfile: true,
        onEachFeature,
      })
        .bindTooltip((layer) =>
          reserveTooltipSimple(layer.feature.properties, landInfo)
        )
        .addTo(map);

      if (line) {
        L.geoJSON(line, {
          style: {
            fillColor: cerPalette.Aubergine,
            color: cerPalette.Aubergine,
            className: "no-hover",
            fillOpacity: 1,
          },
        }).addTo(map);
      }

      const territoryLayer = false;
      mapLegend(map, territoryLayer);
      resetZoom(map, geoLayer, territoryLayer);
      resetListener(map, geoLayer, territoryLayer, true);
      return map;
    }
    dashboardClass.style.display = "none";
    return undefined;
  }

  function loadNonMap() {
    setTitle(meta.company, true);
    clickExtraInfo();
    addpoly2Length(poly2Length, meta.company);
    showIamc();
    setUpHeight(true);
    addTraditionalTerritory();
  }

  function main() {
    async function buildPage() {
      const mapHeight = setLeafletHeight(0.7);
      loadNonMap();
      return loadMap(mapHeight);
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
