import * as L from "leaflet";
import {
  getSum,
  lengthUnits,
  htmlTableRow,
  plural,
  featureStyles,
  removeIncidents,
} from "./util";

import { IamcMap, IncidentInfo } from "./interfaces";

/**
 * TODO: maybe split this method between iamc and profiles. IAMC might need more event info vs profiles.
 * @param event
 */
function eventTooltip(event: IncidentInfo): string {
  const listify = (str: string) => {
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

function addIncidents(map: IamcMap, name: string, incidentFeature: any) {
  removeIncidents(map);
  const incidents: IncidentInfo[] = incidentFeature[name];
  const addCircle = (x: number, y: number, eventInfo: IncidentInfo) =>
    L.circle([x, y], {
      color: featureStyles.incident.color,
      fillColor: featureStyles.incident.fillColor,
      fillOpacity: featureStyles.incident.fillOpacity,
      radius: featureStyles.incident.radius,
      weight: featureStyles.incident.weight,
    }).bindTooltip(eventTooltip(eventInfo));

  const proximityCount = { on: 0, close: 0 };
  if (incidents) {
    map.legend.addItem();
    const points = incidents.map((p: IncidentInfo) => {
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

function reserveTooltip(layer: { NAME1: string }, landInfo: any) {
  const layerInfo = landInfo[layer.NAME1];
  let table = `<table class="map-tooltip"><caption><b>${layer.NAME1}</b></caption>`;
  table += htmlTableRow("Land Type:&nbsp", layerInfo.meta.altype);
  if (layerInfo.meta.bandName) {
    table += htmlTableRow("Band name:&nbsp", layerInfo.meta.bandName);
  }
  const length = lengthUnits(layerInfo.overlaps.reduce(getSum, 0));
  table += htmlTableRow("Total overlap:&nbsp", `${length[0]} ${length[1]}`);
  table += `</table><i class="center-footer">Click to view details</i>`;
  return table;
}

function reservePopUp(reserve: any, landInfo: any, incidentFeature: any) {
  const alertClass = (val: number, type: string) => {
    if (type === "on" && val > 0) {
      return "alert alert-danger";
    }
    if (type === "close" && val > 0) {
      return "alert alert-warning";
    }
    return "alert alert-success";
  };

  const layerInfo = landInfo[reserve.feature.properties.NAME1];
  const proximityCount = addIncidents(
    reserve._map,
    reserve.feature.properties.NAME1,
    incidentFeature
  );
  const total = lengthUnits(layerInfo.overlaps.reduce(getSum, 0));
  let popHtml = `<div class="territory-popup" id="reserve-popup"><h2 class="center-header">${reserve.feature.properties.NAME1}</h2>`;

  // first table: pipeline overlaps
  popHtml += `<table class="table" style="margin-bottom:0px"><h3 class="center-header">Pipeline Overlaps</h3><tbody>`;

  layerInfo.overlaps.forEach(
    (overlap: { length: number; plname: string; status: string }) => {
      const l = lengthUnits(overlap.length);
      popHtml += htmlTableRow(
        `${overlap.plname} (${overlap.status})`,
        `${l[0]}${l[1]}`
      );
    }
  );
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

export function addReserveLayer(
  map: IamcMap,
  landFeature: any,
  landInfo: any,
  incidentFeature: any
) {
  const landGeoJson = L.geoJSON(landFeature, {
    style: featureStyles.reserveOverlap,
  })
    .bindTooltip((layer: any) =>
      reserveTooltip(layer.feature.properties, landInfo)
    )
    .bindPopup((layer) => reservePopUp(layer, landInfo, incidentFeature))
    .addTo(map);

  return landGeoJson;
}
