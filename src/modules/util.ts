import * as L from "leaflet";
import { CommunityFeature } from "./mapClasses/CommunityFeature";
import { BaseMap } from "./mapClasses/BaseMap";

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

/**
 *
 * @param text The row key
 * @param value The row value
 * @returns HTML table row
 */
export function htmlTableRow(
  text: string | null,
  value: string | number | null
): string {
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
 * Converts a length number in meters to kilometers if val is over 1km
 * @param val The length number in meters
 * @returns
 */
export function lengthUnits(val: number): [string, string] {
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
 * @param map leaflet map object
 */
export function removeIncidents(map: BaseMap) {
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
 * Resets the map zoom to default showing all communities and First Nations Reserves
 * @param map leaflet map object
 * @param geoLayer First Nations Reserves leaflet geojson layer
 * @param communityLayer leaflet featureGroup for communities
 * @param fly
 */
export function resetZoom(
  map: BaseMap,
  geoLayer: any,
  communityLayer: CommunityFeature,
  fly = false
) {
  let fullBounds = geoLayer.getBounds();
  if (communityLayer) {
    fullBounds = fullBounds.extend(communityLayer.featureGroup.getBounds());
  }

  if (fly) {
    map.flyToBounds(fullBounds, {
      duration: 0.25,
      easeLinearity: 1,
    });
  } else {
    map.fitBounds(fullBounds);
  }
}

/**
 * Binds an event listener to the "Reset Map" button for re-setting zoom and other map elements
 * @param map leaflet map object
 * @param geoLayer First Nations Reserves leaflet geojson layer
 * @param communityLayer leaflet featureGroup for communities
 */
export function resetListener(
  map: BaseMap,
  geoLayer: any,
  communityLayer: CommunityFeature
) {
  const resetMapElement = document.getElementById("reset-map");
  if (resetMapElement) {
    resetMapElement.addEventListener("click", () => {
      removeIncidents(map);
      map.closePopup();
      map.youAreOn.removeHtml();
      communityLayer.reset();
      resetZoom(map, geoLayer, communityLayer, true);
    });
  }
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
