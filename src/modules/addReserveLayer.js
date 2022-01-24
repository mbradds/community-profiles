import { reserveTooltip, reservePopUp } from "./util.js";

export function addReserveLayer(
  map,
  landFeature,
  featureStyles,
  landInfo,
  incidentFeature
) {
  const geoLayer = L.geoJSON(landFeature, {
    style: featureStyles.reserveOverlap,
    landInfo,
    incidentFeature,
  })
    .bindTooltip((layer) => reserveTooltip(layer.feature.properties, landInfo))
    .bindPopup((layer) => reservePopUp(layer))
    .addTo(map);
  return geoLayer;
}
