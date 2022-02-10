import pointInPolygon from "point-in-polygon";
import haversine from "haversine";
import territoryPolygons from "../company_data/community_profiles/indigenousTerritoriesCa.min.json";
import { findUser, addCustomControl, plural } from "./util";
import { IamcMap, CommunityLayer, CommunityCircle } from "./interfaces";

interface WithinList {
  name: string;
  _leaflet_id: number;
  distance: number;
}

function findNearbyCommunities(
  map: IamcMap,
  communityLayer: CommunityLayer,
  withinDistance: number
): WithinList[] {
  const withinList: WithinList[] = [];
  communityLayer.eachLayer((circle: CommunityCircle) => {
    const circleLocation = circle.getLatLng();
    const distance = haversine(
      { latitude: map.user.lat, longitude: map.user.lng },
      { latitude: circleLocation.lat, longitude: circleLocation.lng },
      { unit: "km" }
    );
    if (distance <= withinDistance) {
      withinList.push({
        name: circle.communityName,
        _leaflet_id: circle._leaflet_id,
        distance,
      });
    }
  });
  return withinList.sort((a, b) => a.distance - b.distance);
}

function findNearbyTerritories(map: IamcMap) {
  try {
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

    let territoryHtmlList = `<h3>You are on ${onTerritories.length} Traditional Territories</h3><ul>`;
    onTerritories.forEach((land) => {
      territoryHtmlList += `<li><a href="${land.description}" target="_blank">${land.Name}</a></li>`;
    });
    territoryHtmlList += "</ul>";
    return territoryHtmlList;
  } catch (err) {
    return `<p>Cant access traditional territory data. Please check back later.</p>`;
  }
}

/**
 * Evaluates the users location against the traditional territory polygons.
 * TODO: extend this function to find communities near the user.
 * @param map leaflet map object
 */
function nearbyStuff(map: IamcMap, communityLayer: CommunityLayer) {
  map.panTo(map.user);

  // find communities and territories near the user
  const nearbyCommunities: WithinList[] = findNearbyCommunities(
    map,
    communityLayer,
    50
  );

  // build the pop-up section
  const addFindButton = (community: WithinList) =>
    `<button type="button" value="${community._leaflet_id}" class="btn btn-primary btn-xs find-near-community">Find</button>`;
  let nearbyTable = "";
  if (nearbyCommunities.length >= 1) {
    nearbyTable += `<table class="table"><thead>
    <tr>
      <th scope="col">Community</th>
      <th scope="col">Est. Distance</th>
      <th scope="col"></th>
    </tr>
  </thead><tbody>`;

    nearbyCommunities.forEach((community) => {
      nearbyTable += `<tr><td>${community.name}</td><td>${Math.round(
        community.distance
      )}km</td><td>${addFindButton(community)}</td></tr>`;
    });
    nearbyTable += `</tbody></table>`;
  }

  map.youAreOn.addSection(
    "ur-on",
    "close-you-are-on",
    `You are within 50km of ${nearbyCommunities.length} ${plural(
      nearbyCommunities.length,
      "community",
      false
    )}`,
    `${nearbyTable} ${findNearbyTerritories(map)}`,
    "Move the blue marker to a new area and click <i>Find Me</i> again to view other locations."
  );
  map.youAreOn.fixScroll("ur-on");
  map.youAreOn.closeBtnListener("close-you-are-on");

  const findButtons = document.querySelectorAll(".find-near-community");
  findButtons.forEach((el) =>
    el.addEventListener("click", (event) => {
      const currentBtn = (<HTMLInputElement>event.target).value;
      if (currentBtn) {
        communityLayer.zoomToId(parseInt(currentBtn));
      }
    })
  );
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
          nearbyStuff(map, communityLayer);
        })
        .catch((err) => {
          if (
            {}.propertyIsEnumerable.call(err, "type") &&
            err.type === "locationerror"
          ) {
            map.youAreOn.updateHtml(
              `<div class="alert alert-danger"><h3 style="margin-bottom:0;">Cant access your location. Try enabling location services and refresh the page.</h3></div>`
            );
          } else {
            throw err;
          }
        });
    } else {
      // check polygons for user
      nearbyStuff(map, communityLayer);
    }
  });
}
