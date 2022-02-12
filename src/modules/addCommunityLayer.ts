import * as L from "leaflet";
import {
  featureStyles,
  htmlTableRow,
  toolTipHtml,
  addCustomControl,
  addHtmlLink,
  formatDate,
  calculateDaysUntil,
} from "./util";

import {
  IamcMap,
  CommunityAttr,
  CommunityLayer,
  CommunityCircle,
} from "./interfaces";

interface LandMarker extends L.CircleMarker {
  electionDate?: Date | null;
  spreadNums?: (number | null)[];
  communityName?: string;
  contactInfo?: string | null;
}

interface CommunityName {
  name: string;
  id: number | null | undefined;
}

type ContactInfo = {
  name: string;
  contact: string | null;
};

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
    if (landInfo.MapLink) {
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
    if (updatedAtDate.getFullYear() !== 1970) {
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
  ].forEach((row) => {
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
  map: IamcMap,
  popHeight: number,
  popWidth: number,
  communityData: { id: number; attributes: CommunityAttr }[]
): Promise<CommunityLayer> {
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
      const landMarker: LandMarker = L.circleMarker(
        [com.Latitude, com.Longitude],
        featureStyles.territory
      );
      com.NextElection = com.NextElection ? new Date(com.NextElection) : null;
      landMarker.electionDate = com.NextElection;
      landMarker.spreadNums = [com.ProjectSpreadNumber];
      landMarker.communityName = com.Name;
      landMarker.contactInfo = com.ContactInformation;
      landMarker.bindTooltip(circleTooltip(com));
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

    const setDisplayDays = (days: string) => {
      const displayDays =
        days === "All"
          ? days
          : `<strong style="color:${featureStyles.territoryElection.fillColor}";>${days} or less</strong>`;

      const displayDaysElement = document.getElementById(
        "election-days-display"
      );
      if (displayDaysElement) {
        displayDaysElement.innerHTML = `<span>Days to election: (${displayDays})</span>`;
      }
    };

    const communityLayer: CommunityLayer = L.featureGroup(landCircles);
    communityLayer.contactControl = addCustomControl("bottomright", map);

    communityLayer.resetSlider = function resetSlider() {
      (<HTMLInputElement>(
        document.getElementById("election-range-slider")
      )).value = "366";
      setDisplayDays("All");
    };

    communityLayer.resetStyle = function resetStyle() {
      this.eachLayer((circle: CommunityCircle) => {
        circle.setStyle({
          ...featureStyles.territory,
        });
      });
      this.resetSlider();
    };

    /**
     * Returns an alphabetically sorted list of all community names in the communityLayer
     * @returns [{id: _leaflet_id, name: string}]
     */
    communityLayer.getNames = function getNames(): CommunityName[] {
      return this.getLayers()
        .map((circle: CommunityCircle) => ({
          name: circle.communityName,
          id: circle._leaflet_id,
        }))
        .sort((a: CommunityName, b: CommunityName) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
    };

    /**
     * Zooms to the selected community by finding the matching id
     * @param id leaflet id of the selected community circle
     */
    communityLayer.zoomToId = function zoomToId(id: number) {
      this.eachLayer((circle: CommunityCircle) => {
        if (circle._leaflet_id === id) {
          map.setView(
            circle.getLatLng(),
            map.getZoom() > 10 ? map.getZoom() : 10
          );
          circle.setStyle({
            color: featureStyles.foundCommunity.color,
            fillColor: featureStyles.foundCommunity.fillColor,
          });
          circle.bringToFront();
        } else {
          circle.setStyle({ ...featureStyles.territory });
        }
      });
    };

    /**
     * Adds an event listener to the election range slider and fires the filterElections method
     */
    communityLayer.electionRangeListener = function electionRangeListener() {
      setDisplayDays("All");
      const slider = <HTMLInputElement>(
        document.getElementById("election-range-slider")
      );
      slider.addEventListener("change", () => {
        const displayValue =
          parseInt(slider.value) > 365 ? "All" : slider.value;
        setDisplayDays(displayValue);
        this.filterElections(displayValue);
      });
    };

    /**
     * Evaluates each communities electionDate vs the current date
     * @param dayRange Number between 0 and 365 or "All"
     */
    communityLayer.filterElections = function filterElections(
      dayRange: string
    ) {
      this._map.legend.removeItem();
      if (dayRange !== "All") {
        this.eachLayer((circle: CommunityCircle) => {
          let insideRange = false;
          if (circle.electionDate) {
            const daysUntilElection = calculateDaysUntil(circle.electionDate);
            if (
              daysUntilElection <= parseInt(dayRange) &&
              daysUntilElection > 0
            ) {
              insideRange = true;
            }
          } else {
            circle.setStyle({
              ...featureStyles.territoryNoElection,
            });
          }
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

    /**
     * Adds a leaflet control popup with community contact info
     * @param contacts [{name: string, contact: string}] contact info for the spread communities
     * @param sprdName display name of the selected spread
     */
    communityLayer.spreadContactPopUp = function spreadContactPopUp(
      contacts: ContactInfo[],
      sprdName: string
    ) {
      map.youAreOn.updateHtml("");
      let contactsTable = `<table class="table"><thead>
      <tr>
        <th scope="col">Community</th>
        <th scope="col">Contact</th>
      </tr>
    </thead><tbody>`;
      contacts.forEach((contact) => {
        contactsTable += `<tr><td>${contact.name}</td><td>${contact.contact}</td>`;
      });
      contactsTable += `</tbody></table>`;
      this.contactControl.addSection(
        "spread-contacts",
        "close-spread-contacts",
        `Contact Info for ${sprdName}`,
        contactsTable,
        ""
      );
      this.contactControl.fixScroll("spread-contacts");
      this.contactControl.closeBtnListener("close-spread-contacts");
    };

    /**
     * Finds all communities in the communityLayer that belong to a selected project spread
     * @param selectedSpreads List of spread numbers that user has clicked on
     * @param color Color code of the clicked spread. Changes the community circle color
     * @param sprdName Display name of the spread
     */
    communityLayer.findSpreads = function findSpreads(
      selectedSpreads: number[],
      color: string,
      sprdName: string
    ) {
      this.resetSlider();
      map.legend.removeItem();
      map.warningMsg.removeWarning();
      const zoomToLayer: CommunityCircle[] = [];
      const contactInfo: ContactInfo[] = [];
      const noCommunities = () =>
        map.warningMsg.addWarning(
          `There are no communities identified for ${sprdName}`
        );
      if (selectedSpreads) {
        this.eachLayer((circle: CommunityCircle) => {
          if (selectedSpreads.some((r) => circle.spreadNums.includes(r))) {
            contactInfo.push({
              name: circle.communityName,
              contact: circle.contactInfo,
            });
            circle.setStyle({
              fillColor: color,
            });
            zoomToLayer.push(circle);
          }
        });
      } else {
        noCommunities();
      }

      if (zoomToLayer.length > 0) {
        map.fitBounds(L.featureGroup(zoomToLayer).getBounds());
        map.legend.addItem("spread", selectedSpreads, color);
        this.spreadContactPopUp(contactInfo, sprdName);
      } else {
        noCommunities();
      }
    };

    /**
     * Adds an event listener to the find community search function
     */
    communityLayer.searchCommunities = function searchCommunities() {
      let options = "";
      this.getNames().forEach((name: { id: number; name: string }) => {
        options += `<option data-id=${name.id} label="" value="${name.name}"></option>`;
      });
      const findCommunitiesElement = document.getElementById(
        "find-communities-container"
      );
      if (findCommunitiesElement) {
        findCommunitiesElement.innerHTML = `
        <input type="text" id="community-search" name="community-search" list="suggestions" />
        <button class="btn btn-primary btn-xs header-btn" id="find-communities-btn">Find Community</button>
        <datalist id="suggestions">
        ${options}
        </datalist>
        <div id="community-search-error"></div>`;
      }

      const findComBtnElement = document.getElementById("find-communities-btn");
      if (findComBtnElement) {
        findComBtnElement.addEventListener("click", () => {
          const listItems = <HTMLSelectElement>(
            document.getElementById("suggestions")
          );
          const listObj = <HTMLInputElement>(
            document.getElementById("community-search")
          );
          let foundId;
          Array.from(listItems.options).forEach((item) => {
            if (item.value === listObj.value) {
              foundId = parseInt(item.getAttribute("data-id"));
            }
          });
          if (foundId) {
            this.resetSearchError();
            this.zoomToId(foundId);
          } else if (listObj.value !== "") {
            this.searchError("Cant find community");
          }
        });
      }
    };

    /**
     * Binds an error warning next to the search function when the user input community cant be found
     * @param message
     */
    communityLayer.searchError = function searchError(message: string) {
      const comSearchErrElement = document.getElementById(
        "community-search-error"
      );
      if (comSearchErrElement) {
        comSearchErrElement.innerHTML = `<div class="alert alert-danger"><span>${message}</span></div>`;
      }
    };

    /**
     * Closes the map warning message, the contactControl popup and sets communities to the default color
     */
    communityLayer.resetSpreads = function resetSpreads() {
      map.warningMsg.removeWarning();
      this.contactControl.updateHtml("");
      this.eachLayer((circle: CommunityCircle) => {
        circle.setStyle({
          ...featureStyles.territory,
        });
      });
    };

    communityLayer.resetSearchError = function resetSearchError() {
      const comSearchErrElement = document.getElementById(
        "community-search-error"
      );
      if (comSearchErrElement) {
        comSearchErrElement.innerHTML = "";
      }
    };

    communityLayer.resetSearch = function resetSearch() {
      (<HTMLInputElement>document.getElementById("community-search")).value =
        "";
      this.resetSearchError();
    };

    /**
     * Resets community spreads, styles, and search
     */
    communityLayer.reset = function reset() {
      this.resetSpreads();
      this.resetStyle();
      this.resetSearch();
    };

    communityLayer.addTo(map);
    return communityLayer;
  }
  return addCircles();
}
