import * as L from "leaflet";
import { CommunityLayer, IamcMap, MapControl } from "./interfaces";

declare global {
  interface Window {
    openFullscreen: any;
  }
}

interface MapLegendControl extends MapControl {
  addItem?: Function;
  removeItem?: Function;
}

interface CustomControl extends MapControl {
  updateHtml?: Function;
  removeHtml?: Function;
  fixScroll?: Function;
  closeBtnListener?: Function;
  addSection?: Function;
}

export const cerPalette = {
  "Night Sky": "#054169",
  Sun: "#FFBE4B",
  Ocean: "#5FBEE6",
  Forest: "#559B37",
  Flame: "#FF821E",
  Aubergine: "#871455",
  "Dim Grey": "#8c8c96",
  "Cool Grey": "#42464B",
  hcBlue: "#7cb5ec",
  hcGreen: "#90ed7d",
  hcPink: "#f15c80",
  hcRed: "#f45b5b",
  hcAqua: "#2b908f",
  hcPurple: "#8085e9",
  hcLightBlue: "#91e8e1",
};

function openFullscreen() {
  const elem: any = document.getElementById("map-panel");
  elem.style.width = "100%";
  elem.style.height = "100%";
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen();
  }
}

window.openFullscreen = openFullscreen;

/**
 *
 * @param text The row key
 * @param value The row value
 * @returns HTML table row
 */
export function htmlTableRow(text: string, value: string | number): string {
  return `<tr><td>${text}</td><td><b>${value}</b></td></tr>`;
}

/**
 *
 * @param headText Centered <h3> sized tooltip title
 * @param midText Optional <p> in between headText and footText
 * @param footText Centered <i> text at the bottom of the tooltip
 * @param color Optional color for the headText
 * @returns HTML table
 */
export function toolTipHtml(
  headText: string | number | null,
  midText: string | number | boolean,
  footText: string | number,
  color = false
): string {
  let style = "margin-bottom: 5px";
  if (color) {
    style += `; color:${color}`;
  }
  let table = `<h3 class="center-header" style="${style}"><b>${headText}</b></h3>`;
  if (midText) {
    table += `<p class="center-footer">${midText}</p>`;
  }
  table += `<i class="center-footer">${footText}</i>`;
  return table;
}

export const featureStyles = {
  territory: {
    color: cerPalette["Night Sky"],
    fillColor: cerPalette["Dim Grey"],
    weight: 20,
    opacity: 0.1,
    fillOpacity: 1,
  },
  territoryElection: {
    color: cerPalette["Night Sky"],
    fillColor: cerPalette.Forest,
    weight: 20,
    opacity: 0.1,
    fillOpacity: 1,
  },
  territoryNoElection: {
    color: cerPalette["Night Sky"],
    fillColor: cerPalette["Dim Grey"],
    weight: 5,
    opacity: 0.1,
    fillOpacity: 0.1,
  },
  incident: {
    color: cerPalette["Cool Grey"],
    fillColor: cerPalette.hcRed,
    weight: 1,
    fillOpacity: 1,
    radius: 600,
  },
  mainline: {
    color: cerPalette["Cool Grey"],
    weight: 10,
  },
  reserveOverlap: {
    fillColor: cerPalette["Night Sky"],
    color: cerPalette.Sun,
    weight: 20,
    opacity: 0.5,
    fillOpacity: 1,
  },
  foundCommunity: {
    color: cerPalette.Aubergine,
    fillColor: cerPalette.Aubergine,
  },
};

/**
 * Creates an empty leaflet map object
 * @param config Set up options for the leaflet map object
 * @param config.div HTML div where the map will be rendered
 * @param config.zoomDelta Zoom increment for the map
 * @param config.initZoomTo [lat, -long] initial map center
 * @param config.initZoomLevel Initial zoom level for the map
 * @returns leaflet map
 */
export function leafletBaseMap(config: {
  div: string;
  zoomDelta: number;
  initZoomTo: any;
  initZoomLevel: number;
}): IamcMap {
  const map: IamcMap = L.map(config.div, {
    zoomDelta: config.zoomDelta,
    maxZoom: 17,
    minZoom: 4,
    zoomSnap: 0.5,
  }).setView(config.initZoomTo, config.initZoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return map;
}

/**
 * Converts a length number in meters to kilometers if val is over 1km
 * @param val The length number in meters
 * @returns
 */
export function lengthUnits(val: any): [string, string] {
  // TODO: fix this any
  if (val >= 1000) {
    return [(val / 1000).toFixed(1), "km"];
  }
  return [val.toFixed(1), "m"];
}

/**
 * Gets client screen width for sizing the community popup and traditional territory image
 * @returns Pixel width of ther users window
 */
export function setUpHeight(): number {
  return window.screen.width;
}

/**
 * Clears incident circles from the map and resets the map legend
 * @param {Object} map leaflet map object
 */
export function removeIncidents(map: IamcMap) {
  map.legend.removeItem();
  map.eachLayer((layer: any) => {
    if (Object.prototype.hasOwnProperty.call(layer.options, "type")) {
      layer.remove();
    }
  });
}

/**
 * Intermediate function used in array.reduce
 * @param total
 * @param num
 * @returns
 */
export function getSum(total: number, num: { length: number }): number {
  return total + num.length;
}

/**
 * Looks at the number of events (val) and determines if the singular or plural of (type) should be displayed to the user
 * @param val The number of incidents, or number of First Nations Reserves
 * @param type The event name
 * @param cap Whether the returned word should be capitalized
 * @returns The input type with the proper singular/plural case
 */
export function plural(val: number, type: string, cap = false): string {
  function capitalize(s: string, c: boolean) {
    if (c) {
      return s[0].toUpperCase() + s.slice(1);
    }
    return s;
  }
  if (type === "incident" || type === "incidents") {
    return capitalize(val > 1 || val === 0 ? "incidents" : "incident", cap);
  }
  if (type === "reserve" || type === "reserves") {
    return capitalize(val > 1 ? "reserves" : "reserve", cap);
  }
  if (type === "communities" || type === "community") {
    return capitalize(val > 1 || val === 0 ? "communities" : "community", cap);
  }
  return type;
}

/**
 *
 * @param map leaflet map object
 * @param communityLayer leaflet featureGroup for communities
 * @returns leaflet control object for map legend
 */
export function mapLegend(
  map: IamcMap,
  communityLayer: CommunityLayer
): MapLegendControl {
  let legend = `<h4><span class="region-click-text" 
  style="height: 10px; background-color: ${featureStyles.reserveOverlap.fillColor}">
  &nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nations Reserve</h4>`;

  if (communityLayer) {
    legend += `<h4 style='color:${featureStyles.mainline.color};'>&#9473;&#9473; Existing Mainline</h4>`;
    legend += `<h4 style='color:${featureStyles.territory.fillColor};'>&#11044; Community</h4>`;
  }
  const info: MapLegendControl = new L.Control({ position: "topright" });
  info.onAdd = function onAdd() {
    this._div = L.DomUtil.create("div", "legend");
    this._div.innerHTML = legend;
    map.legend = this;
    return this._div;
  };
  info.addItem = function addItem(
    entry = "incidents",
    spread: any = undefined,
    color: any = undefined
  ) {
    if (entry === "incidents" && this._div) {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${featureStyles.incident.fillColor};'>&#11044; Incident</h4>`;
    } else if (entry === "spread" && this._div) {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${color};'>&#11044; Spread ${spread} communities</h4>`;
    }
  };
  info.removeItem = function removeItem() {
    Array.from(this._div.getElementsByClassName("legend-temp")).forEach(
      (toHide: HTMLInputElement) => {
        toHide.parentNode.removeChild(toHide);
      }
    );
  };
  info.addTo(map);
  return info;
}

/**
 * Resets the map zoom to default showing all communities and First Nations Reserves
 * @param map leaflet map object
 * @param geoLayer First Nations Reserves leaflet geojson layer
 * @param communityLayer leaflet featureGroup for communities
 * @param fly
 */
export function resetZoom(
  map: IamcMap,
  geoLayer: any,
  communityLayer: CommunityLayer,
  fly = false
) {
  let padd = new L.Point(25, 25);
  let fullBounds = geoLayer.getBounds();
  if (communityLayer) {
    fullBounds = fullBounds.extend(communityLayer.getBounds());
  }

  if (Object.keys(geoLayer._layers).length === 1) {
    padd = new L.Point(270, 270);
  }
  if (fly) {
    map.flyToBounds(fullBounds, {
      duration: 0.25,
      easeLinearity: 1,
      padding: padd,
    });
  } else {
    map.fitBounds(fullBounds, {
      padding: padd,
    });
  }
}

/**
 * Binds an event listener to the "Reset Map" button for re-setting zoom and other map elements
 * @param map leaflet map object
 * @param geoLayer First Nations Reserves leaflet geojson layer
 * @param communityLayer leaflet featureGroup for communities
 */
export function resetListener(
  map: IamcMap,
  geoLayer: any,
  communityLayer: CommunityLayer
) {
  const resetMapElement = document.getElementById("reset-map");
  if (resetMapElement) {
    resetMapElement.addEventListener("click", () => {
      resetZoom(map, geoLayer, communityLayer, true);
      removeIncidents(map);
      map.closePopup();
      map.youAreOn.removeHtml();
      if (communityLayer.reset) {
        communityLayer.reset();
      }
    });
  }
}

/**
 * Finds the user's location, adds a market, and saves location info in map object
 * @param map leaflet map object
 */
export async function findUser(map: IamcMap) {
  return new Promise((resolve, reject) => {
    map
      .locate({
        watch: false,
      })
      .on("locationfound", (e: any) => {
        const marker: L.Marker = L.marker([e.latitude, e.longitude], {
          draggable: true,
        }).bindPopup("Click and drag to move locations");
        marker.on("drag", (d) => {
          map.user = d.target.getLatLng();
        });
        // marker.id = "userLocation";
        map.addLayer(marker);
        map.user = marker.getLatLng();
        resolve(marker);
      })
      .on("locationerror", (err: any) => {
        reject(err);
      });
  });
}

/**
 * Replaces the map container with a wet4 alert-danger
 * @param header Error message title
 * @param err
 */
export function appError(header: string, err: any) {
  const errorDiv = document.getElementById("error-container");
  if (errorDiv) {
    errorDiv.innerHTML = `<section class="alert alert-danger">
       <h3>${header}</h3>
       <p>Please try refreshing the page. If the problem persists, please submit an issue using the email below, with the following error message attached:</p>
       ${JSON.stringify(err.message)}
    </section>`;
  }
}

/**
 *
 * @param position leaflet position for the control
 * @param map leaflet map object
 * @returns leaflet control object
 */
export function addCustomControl(position: L.ControlPosition, map: IamcMap) {
  const info: CustomControl = new L.Control({ position });
  info.setPosition(position);
  info.onAdd = function onAdd() {
    this._div = L.DomUtil.create("div");
    this._div.innerHTML = ``;
    return this._div;
  };
  info.updateHtml = function updateHtml(html: string) {
    if (this._div) {
      this._div.innerHTML = html;
    }
  };
  info.removeHtml = function removeHtml() {
    if (this._div) {
      this._div.innerHTML = "";
    }
  };
  info.fixScroll = function fixScroll(popUpId: string) {
    L.DomEvent.on(
      L.DomUtil.get(popUpId),
      "mousewheel",
      L.DomEvent.stopPropagation
    );
  };
  info.closeBtnListener = function closeBtnListener(closeId: string) {
    const closeBtn = document.getElementById(closeId);
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.removeHtml();
      });
    }
  };
  /**
   * Add a wet4 info section to the control
   * @param sectionId HTML id for the section
   * @param closeBtnId HTML id for the close button
   * @param header Section header text
   * @param bodyHtml HTML partial for the panel body
   * @param footer Optional paragraph text below the bodyHtml
   */
  info.addSection = function addSection(
    sectionId: string,
    closeBtnId: string,
    header: string,
    bodyHtml: string,
    footer: string
  ) {
    this.updateHtml(`<section class="panel panel-default" id="${sectionId}">
    <header class="panel-heading">
     <h5 class="panel-title header-text">${header}</h5>
     <div class="pull-right header-btn">
     <button
       type="button"
       class="btn btn-primary btn-xs"
       id="${closeBtnId}"
     >
     Close
     </button>
   </div>
    </header>
    <div class="panel-body">
     ${bodyHtml}
     <p style="margin-bottom:0px;">${footer}</p>
    </div>
  </section>`);
  };
  info.addTo(map);
  return info;
}

export function addHtmlLink(href: string, display: string, cls = "") {
  if (cls !== "") {
    return `<a class="${cls}" href="${href}" target="_blank">${display}</a>`;
  }
  return `<a href="${href}" target="_blank">${display}</a>`;
}

export function calculateDaysUntil(inputDate: Date) {
  return Math.round((inputDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function formatDate(inputDate: Date): [string, number] {
  const dateString = `${
    inputDate.getMonth() + 1
  }/${inputDate.getDate()}/${inputDate.getFullYear()}`;
  return [dateString, calculateDaysUntil(inputDate)];
}
