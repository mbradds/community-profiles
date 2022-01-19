import * as L from "leaflet";
import communityInfo from "../company_data/community_profiles/community_info.json";
import { featureStyles, htmlTableRow } from "./util.js";

function popUpTable(landInfo, hasImage) {
  let tableHtml = "";
  if (hasImage) {
    if (landInfo[0].srcLnk) {
      tableHtml += `<p>Image source:&nbsp;<a href="${landInfo[0].srcLnk}" target="_blank">${landInfo[0].srcTxt}</a></p>`;
    } else {
      tableHtml += `<p>Image source:&nbsp;not available</p>`;
    }
    tableHtml += `<div id="image-disclaimer" class="alert alert-warning">
    <h2>&nbsp; Traditional Territory Map Disclaimer</h2>
    <p>These maps have been prepared using the Canada Energy Regulator
      internal Indigenous Engagement site information. These maps
      provide general information regarding each Nation including the
      general area of traditional territories. However, these maps do
      not represent the exact dimensions for the traditional territory
      of each Nation.</p></div>`;
  }

  landInfo.forEach((land) => {
    let table = `<table class="table"><tbody><h2 class="center-header">${land.community}</h2>`;
    if (land.pronounce) {
      table += `<h3 class="center-header"><i>Pronounced: ${land.pronounce}</i></h3>`;
    }
    if (land.web) {
      table += `<a class="center-header" href="${land.web}" target="_blank">Community Website</a>`;
    }
    [
      ["Leadership", land.leadership],
      ["Contact Person", land.contactPerson],
      ["Contact Information", land.contactInfo],
      ["Address", land.address],
      ["Protocol", land.protocol],
      ["Project Spreads", land.spread],
      ["About Us", land.about],
    ].forEach((row) => {
      table += htmlTableRow(row[0], `${row[1] ? row[1] : "Not available"}`);
    });
    table += `</tbody></table>`;
    tableHtml += table;
  });
  return tableHtml;
}

export function addCommunityLayer(map, popHeight, popWidth) {
  function circleTooltip(landInfo) {
    const communityNames = landInfo
      .map((land) =>
        !land.pronounce
          ? land.community
          : `${land.community}&nbsp;(<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> <i>${land.pronounce}</i>)`
      )
      .join("<br>");
    const plural = landInfo.length > 1 ? "communities" : "community";
    let table = `<h3 class="center-header" style="margin-bottom: 5px"><b>${communityNames}</b></h3>`;
    table += `<p class="center-footer">Circle represents approximate location of the ${plural}</p>`;
    table += `<i class="center-footer">Click to view full community info and traditional territory map</i>`;
    return table;
  }

  function addCircles() {
    const landCircles = Object.keys(communityInfo).map((landName) => {
      const land = communityInfo[landName];
      const params = featureStyles.territory;
      const landMarker = L.circleMarker([land.loc[0], land.loc[1]], params);
      landMarker.electionDate = land.info.map((l) => l.election);
      landMarker.spreadNums = land.info.map((l) => l.spreadNumber);
      landMarker.bindTooltip(circleTooltip(land.info));
      const hasImage = !!land.info[0].map;
      const imgHtml = hasImage
        ? `<img src="../images/territories/${landName}.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>`
        : `<div class="well" style="text-align: center;"><span class="h3">Traditional Territory image not available<span></div>`;
      landMarker.bindPopup(
        `<div class="territory-popup iamc-popup">${imgHtml}${popUpTable(
          land.info,
          hasImage
        )}</div>`,
        {
          maxHeight: `${popHeight}`,
          maxWidth: `${popWidth}`,
        }
      );
      return landMarker;
    });

    const communityCircleLayer = L.featureGroup(landCircles);

    const setDisplayDays = (days) => {
      const display = document.getElementById("election-days-display");
      const displayDays =
        days === "All"
          ? days
          : `<strong style="color:${featureStyles.territoryElection.fillColor}";>${days} or less</strong>`;
      display.innerHTML = `<span>Days to election: (${displayDays})</span>`;
    };

    communityCircleLayer.resetSlider = function () {
      document.getElementById("election-range-slider").value = "366";
      setDisplayDays("All");
    };

    communityCircleLayer.resetStyle = function () {
      Object.values(this._layers).forEach((circle) => {
        circle.setStyle({
          ...featureStyles.territory,
        });
      });
      this.resetSlider();
    };

    communityCircleLayer.electionRangeListener = function () {
      setDisplayDays("All");
      const slider = document.getElementById("election-range-slider");
      slider.addEventListener("change", () => {
        const displayValue = slider.value > 365 ? "All" : slider.value;
        setDisplayDays(displayValue);
        this.filterElections(displayValue);
      });
    };

    communityCircleLayer.filterElections = function (dayRange) {
      this._map.legend.removeItem();
      const currentDate = Date.now();
      if (dayRange !== "All") {
        Object.values(this._layers).forEach((circle) => {
          let insideRange = false;
          circle.electionDate.forEach((date) => {
            if (date.length === 3) {
              const thisElection = new Date(date[2], date[0] - 1, date[1]);
              const daysUntilElection =
                (thisElection.getTime() - currentDate) / (1000 * 3600 * 24);
              if (
                daysUntilElection <= parseInt(dayRange, 10) &&
                daysUntilElection > 0
              ) {
                insideRange = true;
              }
            } else {
              circle.setStyle({
                ...featureStyles.territoryNoElection,
              });
            }
          });
          if (insideRange) {
            circle.setStyle({
              ...featureStyles.territoryElection,
            });
          } else {
            circle.setStyle({
              ...featureStyles.territoryNoElection,
            });
          }
        });
      } else {
        this.resetStyle();
      }
    };

    communityCircleLayer.resetSpreads = function () {
      map.warningMsg.removeWarning();
      Object.values(this._layers).forEach((circle) => {
        circle.setStyle({
          ...featureStyles.territory,
        });
      });
    };
    communityCircleLayer.findSpreads = function (highlight) {
      this.resetSlider();
      map.legend.removeItem();
      map.warningMsg.removeWarning();
      const zoomToLayer = [];
      Object.values(this._layers).forEach((circle) => {
        if (circle.spreadNums.includes(highlight)) {
          circle.setStyle({
            ...featureStyles.community,
          });
          zoomToLayer.push(circle);
        }
      });
      if (zoomToLayer.length > 0) {
        map.fitBounds(L.featureGroup(zoomToLayer).getBounds());
        map.legend.addItem("spread", highlight);
      } else {
        map.warningMsg.addWarning(
          `There are no communities identified for Spread ${highlight}`
        );
      }
    };

    communityCircleLayer.addTo(map);
    return communityCircleLayer;
  }
  return addCircles();
}

/**
 * deprecated
 */
export function addDigitalTerritory(
  territory,
  digitalMatch,
  popHeight,
  popWidth
) {
  const digitalTerritoryLayer = L.geoJSON(territory, {
    style(feature) {
      return { color: feature.properties.color };
    },
  })
    .bindTooltip(
      (layer) => {
        let table = `<table class="map-tooltip">`;
        table += `<caption><b>${layer.feature.properties.Name}</b></caption>`;
        table += htmlTableRow("Land Type:&nbsp", "Traditional Territory");
        table += `</table><i class="center-footer">Click to view details</i>`;
        return table;
      },
      { sticky: true }
    )
    .bindPopup(
      (layer) => {
        const cerInfo = digitalMatch[layer.feature.properties.Slug];
        return `<div class="territory-popup iamc-popup"><img src="../images/${
          cerInfo[0].map
        }.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>${popUpTable(
          cerInfo
        )}</div>`;
      },
      { maxHeight: `${popHeight}`, maxWidth: `${popWidth}` }
    );
  digitalTerritoryLayer.on("add", () => {
    digitalTerritoryLayer.bringToBack();
  });
  return digitalTerritoryLayer;
}
