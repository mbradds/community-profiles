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
 * Overrides the wet4 equal height if it doesnt work.
 * @param {string} divId1 - HTML id of div to compare to second parameter
 * @param {string} divId2 - HMTL id of div to compare to first parameter
 */
export function equalizeHeight(divId1, divId2) {
  const d1 = document.getElementById(divId1);
  const d2 = document.getElementById(divId2);

  d1.style.height = "auto";
  d2.style.height = "auto";

  const d1Height = d1.clientHeight;
  const d2Height = d2.clientHeight;

  const maxHeight = Math.max(d1Height, d2Height);
  if (d1Height !== maxHeight || d2Height !== maxHeight) {
    d1.style.height = `${maxHeight}px`;
    d2.style.height = `${maxHeight}px`;
  }
}

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

export function setLeafletHeight(scale = 0.7) {
  const clientSize = Math.floor(window.innerHeight * scale);
  const leafletDiv = document.getElementById("map");
  leafletDiv.setAttribute("style", `height:${clientSize}px`);
  leafletDiv.style.height = `${clientSize}px`;
  return clientSize;
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

export function setUpHeight(pipelineProfile = false) {
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

  if (pipelineProfile) {
    const clickDivHeight = `${(dbHeight - (15 + 44)).toFixed(0)}`;
    let resetId = ["reset-large", "mrgn-tp-md"];
    if (userClass !== "xs" && userClass !== "sm") {
      document
        .getElementById("click-fn-info")
        .setAttribute("style", `height:${clickDivHeight}px`);
    } else {
      resetId = ["reset-small", "mrgn-bttm-md mrgn-tp-md"];
    }
    document.getElementById(
      resetId[0]
    ).innerHTML = `<button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg ${resetId[1]}">Reset Map</button>`;
  }

  return [userClass, userWidth];
}

export function addpoly2Length(treaties, company) {
  let treatyHtml = `<table class="table"><thead><tr><th scope="col" class="col-sm-6">Treaty Name</th><th scope="col" class="col-sm-6">Operating Km</th></tr></thead><tbody>`;
  treaties.forEach((land) => {
    treatyHtml += `<tr><td>${land.ENAME}:</td><td> ${(
      land.length_gpd / 1000
    ).toFixed(0)} km</td></tr>`;
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
  toolText += `<tr><td>Status:&nbsp</td><td><b>${event.status}</td></tr>`;
  toolText += `<tr><td>Incident Type:&nbsp</td><td><b>${event.type}</td></tr>`;
  toolText += `<tr><td>Substance:&nbsp</td><td><b>${event.sub}</td></tr>`;
  toolText += `<tr><td>What Happened:&nbsp</td><td><b>${listify(
    event.what
  )}</td></tr>`;
  toolText += `<tr><td>Why It Happened:&nbsp</td><td><b>${listify(
    event.why
  )}</td></tr>`;
  toolText += `<tr><td>Approximate volume released:&nbsp</td><td><b>${
    event.vol === null ? "Not provided" : `${event.vol} (m3)`
  }</td></tr>`;
  if (event.distance > 0) {
    const lengthInfo = lengthUnits(event.distance);
    toolText += `<tr><td>Approximate distance from ${event.landId}:&nbsp</td><td><b>${lengthInfo[0]}&nbsp${lengthInfo[1]}</td></tr>`;
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
    popHtml += `<tr><td>${overlap.plname} (${overlap.status})</td><td><b>${l[0]}${l[1]}<b></td></tr>`;
  });
  if (layerInfo.overlaps.length > 1) {
    popHtml += `<tr><td>Total: </td><td><b>${total[0]}${total[1]}<b></td></tr>`;
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

export function onEachFeature(feature, layer) {
  const alertClass = (val, type) => {
    if (type === "on" && val > 0) {
      return "alert alert-danger";
    }
    if (type === "close" && val > 0) {
      return "alert alert-warning";
    }
    return "alert alert-success";
  };

  const { landInfo } = this;
  const { incidentFeature } = this;

  const popStyle = { h: 3 };
  if (this.pipelineProfile) {
    popStyle.h = 5;
  }

  layer.on({
    click(e) {
      const layerInfo = landInfo[feature.properties.NAME1];
      const totalLength = layerInfo.overlaps.reduce(getSum, 0);

      this._map.fitBounds(e.target.getBounds(), {
        padding: [200, 200],
      });

      const proximityCount = addIncidents(
        this._map,
        feature.properties.NAME1,
        incidentFeature
      );
      const total = lengthUnits(totalLength);
      let popHtml = `<h${popStyle.h} class="center-header">${feature.properties.NAME1}</h${popStyle.h}>`;

      // first table: pipeline overlaps
      popHtml += `<table class="table" style="margin-bottom:0px">`;
      popHtml += `<caption>Pipeline Overlaps</caption><tbody>`;
      layerInfo.overlaps.forEach((overlap) => {
        const l = lengthUnits(overlap.length);
        popHtml += `<tr><td>${overlap.plname} (${overlap.status})</td><td><b>${l[0]}${l[1]}<b></td></tr>`;
      });
      if (layerInfo.overlaps.length > 1) {
        popHtml += `<tr><td>Total: </td><td><b>${total[0]}${total[1]}<b></td></tr>`;
      }
      popHtml += `</tbody></table>`;

      // second table: incident overlaps
      popHtml += `<table class="table" style="margin-bottom:0px">`;
      popHtml += `<caption>Incident Overlaps</caption></table>`;

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
      )} within 15km</p></div>`;
      document.getElementById("intersection-details").innerHTML = popHtml;
    },
  });
}

export function mapLegend(map, communityLayer, metisLayer) {
  let legend = `<h4><span class="region-click-text" 
  style="height: 10px; background-color: ${featureStyles.reserveOverlap.fillColor}">
  &nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nations Reserve</h4>`;

  if (metisLayer) {
    legend += `<h4><span class="region-click-text"
    style="height: 10px; background-color: ${featureStyles.metis.fillColor}"">
    &nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;Métis Settlement</h4>`;
  }

  if (communityLayer) {
    legend += `<h4 style='color:${featureStyles.tmx.fillColor};'>&#9473;&#9473; TMX</h4>`;
    legend += `<h4 style='color:${featureStyles.territory.fillColor};'>&#11044; Community</h4>`;
  }
  const info = L.control();
  info.onAdd = function () {
    this._div = L.DomUtil.create("div", "legend");
    this._div.innerHTML = legend;
    map.legend = this;
    return this._div;
  };
  info.addItem = function (entry = "incidents", spread = undefined) {
    if (entry === "incidents") {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${featureStyles.incident.fillColor};'>&#11044; Incident</h4>`;
    } else if (entry === "spread") {
      this._div.innerHTML += `<h4 class="legend-temp" style='color:${featureStyles.community.color};'>&#11044; Spread ${spread} communities</h4>`;
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
  const totalLength = layerInfo.overlaps.reduce(getSum, 0);
  const length = lengthUnits(totalLength);

  let table = `<table class="map-tooltip">`;
  table += `<caption><b>${layer.NAME1}</b></caption>`;
  table += `<tr><td>Land Type:&nbsp</td> <td><b>${layerInfo.meta.altype}</td></tr>`;
  if (layerInfo.meta.bandName) {
    table += `<tr><td>Band name:&nbsp</td> <td><b>${layerInfo.meta.bandName}</td></tr>`;
  }
  table += `<tr><td>Total overlap:&nbsp</td> <td><b>${length[0]} ${length[1]}</td></tr>`;
  table += `</table><i class="center-footer">Click to view details</i>`;
  return table;
}

export function reserveTooltipSimple(layer, landInfo) {
  return `<span class="h3">${layer.NAME1} - ${
    landInfo[layer.NAME1].meta.bandName
  }</span><br><i class="center-footer">Click to view details</i>`;
}

export function clickExtraInfo() {
  document.getElementById(
    "intersection-details"
  ).innerHTML = `<div class="alert alert-info"><p>Click on a <span class="region-click-text" style="background-color: ${featureStyles.reserveOverlap.fillColor};">region</span> to view extra info</p></div>`;
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

export function resetListener(
  map,
  geoLayer,
  communityLayer,
  pipelineProfile = false
) {
  document.getElementById("reset-map").addEventListener("click", () => {
    resetZoom(map, geoLayer, communityLayer, true);
    removeIncidents(map);
    map.closePopup();
    if (pipelineProfile) {
      clickExtraInfo();
    } else {
      map.youAreOn.removeHtml();
      if (communityLayer) {
        communityLayer.resetSpreads();
        communityLayer.resetStyle();
      }
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
