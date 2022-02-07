import * as L from "leaflet";
import { GeoJsonObject } from "geojson";
import { cerPalette, featureStyles, toolTipHtml } from "./util";
import tmxSpreads from "../company_data/trans_mountain_files/pipeline-spread-geometries.json";
import mainline from "../company_data/trans_mountain_files/existing-pipeline.json";

interface ToolTipLayer extends L.Layer {
  feature: { id: number };
  options: { color: boolean };
}

export function tmAssets(map, communityLayer) {
  const mainlineLayer = L.geoJSON(mainline as GeoJsonObject, {
    style: featureStyles.mainline,
  }).addTo(map);
  const tmSpreadLayer = L.geoJSON(tmxSpreads as GeoJsonObject, {
    style(feature) {
      switch (feature.id) {
        case "spread-1":
          return { color: cerPalette.Flame, spreads: [1] };
        case "spread-2":
          return { color: cerPalette.Forest, spreads: [2] };
        case "spread-3-and-4":
          return { color: cerPalette.hcRed, spreads: [3, 4] };
        case "spread-5-a":
          return { color: cerPalette.hcAqua, spreads: [5] };
        case "spread-5-b":
          return { color: cerPalette.hcAqua, spreads: [5] };
        case "spread-6":
          return { color: cerPalette.hcPurple, spreads: [6] };
        case "spread-7":
          return { color: cerPalette.hcPink, spreads: [7] };
        default:
          return { color: cerPalette.Aubergine };
      }
    },
  })
    .bindTooltip(
      (layer: ToolTipLayer) =>
        toolTipHtml(
          layer.feature.id,
          false,
          "Click to isolate communities",
          layer.options.color
        ),
      { sticky: true }
    )
    .addTo(map);
  tmSpreadLayer.on("click", (e) => {
    communityLayer.resetSpreads();
    communityLayer.findSpreads(
      e.layer.options.spreads,
      e.layer.options.color,
      e.layer.feature.id
    );
  });

  return [tmSpreadLayer, mainlineLayer];
  // return [undefined, undefined];
}
