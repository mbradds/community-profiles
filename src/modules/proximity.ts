import pointInPolygon from "point-in-polygon";
import territoryPolygons from "../company_data/community_profiles/indigenousTerritoriesCa.json";
import { findUser, addCustomControl } from "./util";
import { IamcMap, CommunityLayer } from "./interfaces";

/**
 * Evaluates the users location against the traditional territory polygons.
 * TODO: extend this function to find communities near the user.
 * @param map leaflet map object
 */
function nearbyStuff(map: IamcMap) {
  const onTerritories: any[] = [];
  territoryPolygons.features.forEach((polygon) => {
    const inside = pointInPolygon(
      [map.user.lng, map.user.lat],
      polygon.geometry.coordinates[0]
    );
    if (inside) {
      onTerritories.push(polygon.properties);
    }
  });
  map.panTo(map.user);
  let youAreOnTable = "<ul>";
  onTerritories.forEach((land) => {
    youAreOnTable += `<li><a href="${land.description}" target="_blank">${land.Name}</a></li>`;
  });
  youAreOnTable += "</ul>";
  map.youAreOn.addSection(
    "ur-on",
    "close-you-are-on",
    `You are on ${onTerritories.length} Traditional Territories`,
    youAreOnTable,
    "Move the blue marker to a new area and click <i>Find Me</i> again to view other locations."
  );
  map.youAreOn.fixScroll("ur-on");
  map.youAreOn.closeBtnListener("close-you-are-on");
}

/**
 * Evaluates the users location against traditional territory's
 * @param map leaflet map object
 */
export function proximity(map: IamcMap, communityLayer: CommunityLayer) {
  map.youAreOn = addCustomControl("bottomright", map);
  document.getElementById("find-me").addEventListener("click", () => {
    communityLayer.contactControl.updateHtml("");
    if (!map.user) {
      findUser(map)
        .then(() => {
          // check polygons for user
          nearbyStuff(map);
        })
        .catch(() => {
          map.youAreOn.updateHtml(
            `<div class="alert alert-danger"><h3 style="margin-bottom:0;">Cant access your location. Try enabling location services and refresh the page.</h3></div>`
          );
        });
    } else {
      // check polygons for user
      nearbyStuff(map);
    }
  });
}
