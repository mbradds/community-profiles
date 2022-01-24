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

export function htmlTableRow(text, value) {
  return `<tr><td>${text}</td><td><b>${value}</b></td></tr>`;
}

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

export function lengthUnits(val) {
  if (val >= 1000) {
    return [(val / 1000).toFixed(1), "km"];
  }
  return [val.toFixed(1), "m"];
}

export function setTitle(company, pipelineProfiles = false) {
  const titleText = pipelineProfiles
    ? `Map - ${company} & First Nations Reserves`
    : `Map - ${company}`;
  document.getElementById("leaflet-map-title").innerText = titleText;
}

export function setUpHeight() {
  let dbHeight = document.getElementById("map-panel").clientHeight;
  const userWidth = window.screen.width;
  let userClass = "xs";
  if (userWidth < 768) {
    userClass = "xs";
  } else if (userWidth >= 1200) {
    userClass = "lg";
  } else if (userWidth >= 992) {
    userClass = "md";
  } else if (userWidth >= 768) {
    userClass = "sm";
  }

  if (!dbHeight || dbHeight === 0) {
    // set dashboard to 700 pixels if I cant access client screen size
    dbHeight = 700;
  }

  return [userClass, userWidth];
}

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

function removeIncidents(map) {
  map.legend.removeItem();
  map.eachLayer((layer) => {
    if (Object.prototype.hasOwnProperty.call(layer.options, "type")) {
      layer.remove();
    }
  });
}

/**
 * TODO: maybe split this method between iamc and profiles. IAMC might need more event info vs profiles.
 * @param {*} event
 * @returns
 */
function eventTooltip(event) {
  const listify = (str) => {
    if (str.includes(",")) {
      let listHtml = `<ul>`;
      str.split(",").forEach((li) => {
        listHtml += `<li>${li}</li>`;
      });
      listHtml += `</ul>`;
      return listHtml;
    }
    return str;
  };

  let toolText = `<table class="map-tooltip"><caption><b>${event.id}</b></caption>`;
  toolText += htmlTableRow("Status:&nbsp", event.status);
  toolText += htmlTableRow("Incident Type:&nbsp", event.type);
  toolText += htmlTableRow("Substance:&nbsp", event.sub);
  toolText += htmlTableRow("What Happened:&nbsp", listify(event.what));
  toolText += htmlTableRow("Why It Happened:&nbsp", listify(event.why));
  toolText += htmlTableRow(
    "Approximate volume released:&nbsp",
    event.vol === null ? "Not provided" : `${event.vol} (m3)`
  );

  if (event.distance > 0) {
    const lengthInfo = lengthUnits(event.distance);
    toolText += htmlTableRow(
      `Approximate distance from ${event.landId}:&nbsp`,
      `${lengthInfo[0]}&nbsp${lengthInfo[1]}`
    );
  }
  return toolText;
}

export function addIncidents(map, name, incidentFeature) {
  removeIncidents(map);
  const incidents = incidentFeature[name];
  const addCircle = (x, y, eventInfo) =>
    L.circle([x, y], {
      color: featureStyles.incident.color,
      fillColor: featureStyles.incident.fillColor,
      fillOpacity: featureStyles.incident.fillOpacity,
      radius: featureStyles.incident.radius,
      weight: featureStyles.incident.weight,
      type: "incident",
    }).bindTooltip(eventTooltip(eventInfo));

  const proximityCount = { on: 0, close: 0 };
  if (incidents) {
    map.legend.addItem();
    const points = incidents.map((p) => {
      if (p.distance === 0) {
        proximityCount.on += 1;
      } else {
        proximityCount.close += 1;
      }
      return addCircle(p.loc[0], p.loc[1], p);
    });
    L.featureGroup(points).addTo(map);
  }
  return proximityCount;
}

function getSum(total, num) {
  return total + num.length;
}

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

export function reservePopUp(reserve) {
  const alertClass = (val, type) => {
    if (type === "on" && val > 0) {
      return "alert alert-danger";
    }
    if (type === "close" && val > 0) {
      return "alert alert-warning";
    }
    return "alert alert-success";
  };

  const { landInfo } = reserve.defaultOptions;
  const { incidentFeature } = reserve.defaultOptions;
  const layerInfo = landInfo[reserve.feature.properties.NAME1];
  const totalLength = layerInfo.overlaps.reduce(getSum, 0);

  const proximityCount = addIncidents(
    reserve._map,
    reserve.feature.properties.NAME1,
    incidentFeature
  );
  const total = lengthUnits(totalLength);
  let popHtml = `<div class="iamc-popup" id="reserve-popup"><h2 class="center-header">${reserve.feature.properties.NAME1}</h2>`;

  // first table: pipeline overlaps
  popHtml += `<table class="table" style="margin-bottom:0px">`;
  popHtml += `<h3 class="center-header">Pipeline Overlaps</h3><tbody>`;

  layerInfo.overlaps.forEach((overlap) => {
    const l = lengthUnits(overlap.length);
    popHtml += htmlTableRow(
      `${overlap.plname} (${overlap.status})`,
      `${l[0]}${l[1]}`
    );
  });
  if (layerInfo.overlaps.length > 1) {
    popHtml += htmlTableRow("Total: ", `${total[0]}${total[1]}`);
  }
  popHtml += `</tbody></table><h3 class="center-header">Incident Overlaps</h3>`;
  popHtml += `<div style="margin-bottom: 15px" class="${alertClass(
    proximityCount.on,
    "on"
  )} col-md-12"><p>${proximityCount.on} ${plural(
    proximityCount.on,
    "incident",
    false
  )} directly within</p></div>`;
  popHtml += `<div class="${alertClass(
    proximityCount.close,
    "close"
  )} col-md-12"><p>${proximityCount.close} ${plural(
    proximityCount.close,
    "incident",
    false
  )} within 15km</p></div></div>`;
  return popHtml;
}

export function mapLegend(map, communityLayer) {
  let legend = `<h4><span class="region-click-text" 
  style="height: 10px; background-color: ${featureStyles.reserveOverlap.fillColor}">
  &nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nations Reserve</h4>`;

  if (communityLayer) {
    // legend += `<h4 style='color:${featureStyles.tmx.fillColor};'>&#9473;&#9473; TMX</h4>`;
    legend += `<h4 style='color:${featureStyles.mainline.color};'>&#9473;&#9473; Mainline</h4>`;
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

export function reserveTooltip(layer, landInfo) {
  const layerInfo = landInfo[layer.NAME1];
  const length = lengthUnits(layerInfo.overlaps.reduce(getSum, 0));

  let table = `<table class="map-tooltip"><caption><b>${layer.NAME1}</b></caption>`;
  table += htmlTableRow("Land Type:&nbsp", layerInfo.meta.altype);
  if (layerInfo.meta.bandName) {
    table += htmlTableRow("Band name:&nbsp", layerInfo.meta.bandName);
  }
  table += htmlTableRow("Total overlap:&nbsp", `${length[0]} ${length[1]}`);
  table += `</table><i class="center-footer">Click to view details</i>`;
  return table;
}

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

export function resetListener(map, geoLayer, communityLayer) {
  document.getElementById("reset-map").addEventListener("click", () => {
    resetZoom(map, geoLayer, communityLayer, true);
    removeIncidents(map);
    map.closePopup();
    map.youAreOn.removeHtml();
    if (communityLayer) {
      communityLayer.resetSpreads();
      communityLayer.resetStyle();
    }
  });
}

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
