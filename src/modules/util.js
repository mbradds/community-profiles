import * as L from "leaflet";

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
  const elem = document.getElementById("map-panel");
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
 * @param {string} text The row key
 * @param {string} value The row value
 * @returns {string} HTML table row
 */
export function htmlTableRow(text, value) {
  return `<tr><td>${text}</td><td><b>${value}</b></td></tr>`;
}

/**
 *
 * @param {string} headText Centered <h3> sized tooltip title
 * @param {string} midText Optional <p> in between headText and footText
 * @param {string} footText Centered <i> text at the bottom of the tooltip
 * @param {string} color Optional color for the headText
 * @returns {string} HTML table
 */
export function toolTipHtml(headText, midText, footText, color) {
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
    weight: 50,
    opacity: 0.1,
    fillOpacity: 1,
  },
  territoryElection: {
    color: cerPalette["Night Sky"],
    fillColor: cerPalette.Forest,
    weight: 50,
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
  community: {
    fillColor: cerPalette["Night Sky"],
    color: cerPalette.Ocean,
    opacity: 0.7,
  },
  incident: {
    color: cerPalette["Cool Grey"],
    fillColor: cerPalette.hcRed,
    weight: 1,
    fillOpacity: 1,
    radius: 600,
  },
  tmx: {
    fillColor: cerPalette.Aubergine,
    color: cerPalette.Aubergine,
    className: "no-hover",
    fillOpacity: 1,
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
  metis: {
    fillColor: cerPalette.Forest,
    color: cerPalette.Flame,
    weight: 10,
    opacity: 0.5,
    fillOpacity: 1,
  },
  spread: {
    fillColor: cerPalette.Aubergine,
    color: cerPalette.Aubergine,
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.1,
    radius: 10,
  },
};

/**
 * Creates an empty leaflet map object
 * @param {Object} config Set up options for the leaflet map object
 * @param {string} config.div HTML div where the map will be rendered
 * @param {number} config.zoomDelta Zoom increment for the map
 * @param {Array.<number>} config.initZoomTo [lat, -long] initial map center
 * @param {string} config.initZoomLevel Initial zoom level for the map
 * @returns {Object} leaflet map
 */
export function leafletBaseMap(config) {
  const map = new L.map(config.div, {
    zoomDelta: config.zoomDelta,
    maxZoom: 17,
    minZoom: 4,
    zoomSnap: 0.5,
  }).setView(config.initZoomTo, config.initZoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
    foo: "bar",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return map;
}

/**
 * Converts a length number in meters to kilometers if val is over 1km
 * @param {number} val The length number in meters
 * @returns {[number, string]}
 */
export function lengthUnits(val) {
  if (val >= 1000) {
    return [(val / 1000).toFixed(1), "km"];
  }
  return [val.toFixed(1), "m"];
}

/**
 * deprecated
 * @param {string} company
 */
export function setTitle(company) {
  document.getElementById("leaflet-map-title").innerText = `Map - ${company}`;
}

/**
 * Gets client screen width for sizing the community popup and traditional territory image
 * @returns {number} Pixel width of ther users window
 */
export function setUpHeight() {
  let dbHeight = document.getElementById("map-panel").clientHeight;
  const userWidth = window.screen.width;
  if (!dbHeight || dbHeight === 0) {
    // set dashboard to 700 pixels if I cant access client screen size
    dbHeight = 700;
  }
  return userWidth;
}

/**
 * Adds an HTML table with the pipeline intersection length with numbered treaties
 * @param {Object[]} treaties Info about numbered treaty overlap
 * @param {string} company Company name
 */
export function addpoly2Length(treaties, company) {
  let treatyHtml = `<table class="table"><thead><tr><th scope="col" class="col-sm-6">Treaty Name</th><th scope="col" class="col-sm-6">Operating Km</th></tr></thead><tbody>`;
  treaties.forEach((land) => {
    treatyHtml += htmlTableRow(
      `${land.ENAME}:`,
      `${(land.length_gpd / 1000).toFixed(0)} km`
    );
  });
  treatyHtml += "</tbody></table>";
  document.getElementById("treaty-length").innerHTML = treatyHtml;
  // add title
  document.getElementById(
    "treaty-length-title"
  ).innerText = `${company} & Historic Treaty Land`;
}

/**
 * Clears incident circles from the map and resets the map legend
 * @param {Object} map leaflet map object
 */
export function removeIncidents(map) {
  map.legend.removeItem();
  map.eachLayer((layer) => {
    if (Object.prototype.hasOwnProperty.call(layer.options, "type")) {
      layer.remove();
    }
  });
}

/**
 * Intermediate function used in array.reduce
 * @param {number} total
 * @param {Object} num
 * @returns {number}
 */
export function getSum(total, num) {
  return total + num.length;
}

/**
 * Looks at the number of events (val) and determines if the singular or plural of (type) should be displayed to the user
 * @param {number} val The number of incidents, or number of First Nations Reserves
 * @param {string} type The event name
 * @param {boolean} [cap=false] Whether the returned word should be capitalized
 * @returns {string} The input type with the proper singular/plural case
 */
export function plural(val, type, cap = false) {
  function capitalize(s, c) {
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
  return type;
}

/**
 *
 * @param {Object} map leaflet map object
 * @param {Object} communityLayer leaflet featureGroup for communities
 * @returns {Object} leaflet control object for map legend
 */
export function mapLegend(map, communityLayer) {
  let legend = `<h4><span class="region-click-text" 
  style="height: 10px; background-color: ${featureStyles.reserveOverlap.fillColor}">
  &nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nations Reserve</h4>`;

  if (communityLayer) {
    legend += `<h4 style='color:${featureStyles.mainline.color};'>&#9473;&#9473; Existing Mainline</h4>`;
    legend += `<h4 style='color:${featureStyles.territory.fillColor};'>&#11044; Community</h4>`;
  }
  const info = L.control();
  info.onAdd = function () {
    this._div = L.DomUtil.create("div", "legend");
    this._div.innerHTML = legend;
    map.legend = this;
    return this._div;
  };
  info.addItem = function (
    entry = "incidents",
    spread = undefined,
    color = undefined
  ) {
    if (entry === "incidents") {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${featureStyles.incident.fillColor};'>&#11044; Incident</h4>`;
    } else if (entry === "spread") {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${
        color || featureStyles.community.color
      };'>&#11044; Spread ${spread} communities</h4>`;
    }
  };
  info.removeItem = function () {
    Array.from(this._div.getElementsByClassName("legend-temp")).forEach(
      (toHide) => {
        toHide.parentNode.removeChild(toHide);
      }
    );
  };
  info.addTo(map);
  return info;
}

/**
 * Resets the map zoom to default showing all communities and First Nations Reserves
 * @param {Object} map leaflet map object
 * @param {Object} geoLayer First Nations Reserves leaflet geojson layer
 * @param {Object} communityLayer leaflet featureGroup for communities
 * @param {boolean} [fly=false]
 */
export function resetZoom(map, geoLayer, communityLayer, fly = false) {
  let padd = [25, 25];
  let fullBounds = geoLayer.getBounds();
  if (communityLayer) {
    fullBounds = fullBounds.extend(communityLayer.getBounds());
  }

  if (Object.keys(geoLayer._layers).length === 1) {
    padd = [270, 270];
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
 * @param {Object} map leaflet map object
 * @param {Object} geoLayer First Nations Reserves leaflet geojson layer
 * @param {Object} communityLayer leaflet featureGroup for communities
 */
export function resetListener(map, geoLayer, communityLayer) {
  document.getElementById("reset-map").addEventListener("click", () => {
    resetZoom(map, geoLayer, communityLayer, true);
    removeIncidents(map);
    map.closePopup();
    map.youAreOn.removeHtml();
    if (communityLayer) {
      communityLayer.resetSpreads();
      communityLayer.resetStyle();
      communityLayer.resetSearch();
    }
  });
}

/**
 * Finds the user's location, adds a market, and saves location info in map object
 * @param {Object} map leaflet map object
 * @returns {Promise}
 */
export async function findUser(map) {
  return new Promise((resolve, reject) => {
    map
      .locate({
        watch: false,
      })
      .on("locationfound", (e) => {
        const marker = L.marker([e.latitude, e.longitude], {
          draggable: true,
        }).bindPopup("Click and drag to move locations");
        marker.on("drag", (d) => {
          map.user = d.target.getLatLng();
        });
        marker.id = "userLocation";
        map.addLayer(marker);
        map.user = marker._latlng;
        resolve(marker);
      })
      .on("locationerror", (err) => {
        reject(err);
      });
  });
}

export function appError(header, err) {
  document.getElementById(
    "error-container"
  ).innerHTML = `<section class="alert alert-danger">
  <h3>${header}</h3>
  <p>Please try refreshing the page. If the problem persists, please submit an issue using the email below, with the following error message attached:</p>
  ${JSON.stringify(err.message)}
</section>`;
}

export function addCustomControl(position, map) {
  const info = L.control({ position });
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
  info.fixScroll = function (popUpId) {
    L.DomEvent.on(
      L.DomUtil.get(popUpId),
      "mousewheel",
      L.DomEvent.stopPropagation
    );
  };
  info.closeBtnListener = function (closeId) {
    document.getElementById(closeId).addEventListener("click", () => {
      this.removeHtml();
    });
  };
  /**
   * Add a wet4 info section to the control
   * @param {string} sectionId HTML id for the section
   * @param {string} closeBtnId HTML id for the close button
   * @param {string} header Section header text
   * @param {string} bodyHtml HTML partial for the panel body
   * @param {string} footer Optional paragraph text below the bodyHtml
   */
  info.addSection = function (sectionId, closeBtnId, header, bodyHtml, footer) {
    this.updateHtml(`<section class="panel panel-info" id="${sectionId}">
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
