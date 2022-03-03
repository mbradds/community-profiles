import {
  featureStyles,
  htmlTableRow,
  toolTipHtml,
  addHtmlLink,
  formatDate,
} from "./util";

import { CommunityFeature } from "./mapClasses/CommunityFeature";
import { CommunityCircle } from "./mapClasses/CommunityCircle";
import { BaseMap } from "./mapClasses/BaseMap";
import { CommunityAttr } from "./interfaces";

/**
 * Generates an HTML partial for the community pop-up information
 * @param landInfo Community information for the pop-up
 * @param hasImage Specifies if the pop-up will have a traditional territory image
 * @returns HTML partial to be added to the leaflet community pop-up
 */
function popUpTable(
  imgHtml: string,
  landInfo: CommunityAttr,
  hasImage: boolean
) {
  let tableHtml = "";
  let subImageHtml = "";
  if (hasImage) {
    if (landInfo.MapLink && landInfo.MapSource) {
      subImageHtml += `<p>Image source:&nbsp;${addHtmlLink(
        landInfo.MapLink,
        landInfo.MapSource
      )}</p>`;
    } else {
      subImageHtml += `<p>Image source:&nbsp;not available</p>`;
    }
    subImageHtml += `<div id="image-disclaimer" class="alert alert-warning">
    <h2>&nbsp; Traditional Territory Map Disclaimer</h2>
    <p>These maps have been prepared using the Canada Energy Regulator
      internal Indigenous Engagement site information. These maps
      provide general information regarding each Nation including the
      general area of traditional territories. However, these maps do
      not represent the exact dimensions for the traditional territory
      of each Nation.</p></div>`;
  }

  let table = `<table class="table"><tbody><h2 class="center-header">${landInfo.Name}</h2>`;
  if (landInfo.Pronunciation) {
    table += `<h3 class="center-header"><i>Pronounced: ${landInfo.Pronunciation}</i></h3>`;
  }
  if (landInfo.Website) {
    table += addHtmlLink(
      landInfo.Website,
      "Community Website",
      "center-header"
    );
  }
  if (landInfo.updatedAt) {
    const updatedAtDate = new Date(landInfo.updatedAt);
    if (updatedAtDate.getFullYear() >= 2022) {
      const [dateStringUpdate, daysUntilUpdate] = formatDate(updatedAtDate);
      table += `<h3 class="center-header">Community data updated at: ${dateStringUpdate} (${Math.abs(
        daysUntilUpdate
      )} days ago)</h3>`;
    }
  }

  const [dateStringElec, daysUntilElec] =
    landInfo.NextElection instanceof Date
      ? formatDate(landInfo.NextElection)
      : ["", 0];

  [
    ["Leadership", landInfo.Leadership],
    ["Contact Person", landInfo.ContactPerson],
    [
      "Next Election",
      dateStringElec !== ""
        ? `${dateStringElec} (${daysUntilElec} days)`
        : "Not available",
    ],
    ["Contact Information", landInfo.ContactInformation],
    ["Address", landInfo.Address],
    ["Protocol", landInfo.Protocol],
    ["Project Spreads", landInfo.ProjectSpreads],
    ["Concerns - Issues", landInfo.ConcernsOrIssues],
    ["About Us", landInfo.History],
  ].forEach((row: (string | null)[]) => {
    table += htmlTableRow(row[0], `${row[1] ? row[1] : "Not available"}`);
  });
  table += `</tbody></table>`;

  const resourceHtml = `<h3 class="center-header">Additional Resources</h3><dl class="dl-horizontal">
  <dt>Active Construction:</dt>
  <dd>${addHtmlLink(
    "https://www.transmountain.com/all-communities?b=47.781%2C-128.966%2C54.646%2C-107.323",
    "Trans Mountain Website"
  )}</dd>
  <dt>Secwépemc Communities Pronunciations (audio):</dt>
  <dd>${addHtmlLink(
    "https://www.tru.ca/indigenous/indigenous-education-team/pronunciations.html",
    "Thompson Rivers University Website"
  )}</dd>
</dl`;

  tableHtml += table;
  tableHtml += imgHtml + subImageHtml + resourceHtml;
  return tableHtml;
}

/**
 * Generates a leaflet featureLayer for the communities
 * @param map leaflet map object
 * @param popHeight Height of the pop-up
 * @param popWidth Width of the pop-up
 * @returns leaflet featureLayer for the communities
 */
export function addCommunityLayer(
  map: BaseMap,
  popHeight: number,
  popWidth: number,
  communityData: { id: number; attributes: CommunityAttr }[]
): Promise<CommunityFeature> {
  function circleTooltip(landInfo: CommunityAttr) {
    const communityNames = !landInfo.Pronunciation
      ? landInfo.Name
      : `${landInfo.Name}&nbsp;(<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> <i>${landInfo.Pronunciation}</i>)`;

    return toolTipHtml(
      communityNames,
      `Circle represents approximate location of the community`,
      "Click to view full community info and traditional territory map"
    );
  }

  async function addCircles() {
    const landCircles = communityData.map((community) => {
      const com = community.attributes;
      com.NextElection = com.NextElection ? new Date(com.NextElection) : null;
      const landMarker = new CommunityCircle(
        [com.Latitude, com.Longitude],
        featureStyles.territory,
        com
      );
      landMarker.bindTooltip(circleTooltip(com), {
        className: "community-tooltip",
      });
      const hasImage = com.MapFile !== null;
      const imgHtml = hasImage
        ? `<img src="../images/territories/${com.MapFile}.1.png" height="${popHeight}px" width="${popWidth}px" max-width="${popWidth}px"/>`
        : `<div class="well" style="text-align: center;"><span class="h3">Traditional Territory image not available<span></div>`;
      landMarker.bindPopup(
        `<div class="territory-popup">${popUpTable(
          imgHtml,
          com,
          hasImage
        )}</div>`,
        {
          maxHeight: popHeight,
          maxWidth: popWidth,
        }
      );
      return landMarker;
    });

    return new CommunityFeature(landCircles, map);
  }
  return addCircles();
}
