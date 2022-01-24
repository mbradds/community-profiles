/**
 * deprecated
 */

import { featureStyles } from "./util.js";
import spreadToKp from "../company_data/TransMountainPipelineULC/spreads.json";
import spreads from "../company_data/TransMountainPipelineULC/kilometerPosts.json";

function getSpreadNumber(kpNumber) {
  const foundSpreads = {};
  spreadToKp.forEach((sprd) => {
    if (sprd.Start <= kpNumber && sprd.Stop >= kpNumber) {
      foundSpreads.num = sprd.Number;
      foundSpreads.sub = sprd.Sub;
    }
  });
  return foundSpreads;
}

export function spread(map, communityLayer) {
  const kpCircles = spreads.map((s) => {
    const params = featureStyles.spread;
    params.name = s.n;
    params.sprd = getSpreadNumber(params.name);
    const landMarker = L.circleMarker([s.l[0], s.l[1]], params);
    landMarker.bindTooltip(
      `<strong style="color: ${params.color}";>KP ${params.name} (Spread ${
        params.sprd.sub
          ? `${params.sprd.num} ${params.sprd.sub}`
          : params.sprd.num
      })</strong><br><i>Click to highlight relevant communities</i>`
    );
    return landMarker;
  });

  const spreadLayer = L.featureGroup(kpCircles);
  spreadLayer.on("click", (e) => {
    const spreadNumber = getSpreadNumber(e.sourceTarget.options.name);
    communityLayer.resetSpreads();
    communityLayer.findSpreads(spreadNumber.num);
  });
  spreadLayer.addTo(map);
  return spreadLayer;
}
