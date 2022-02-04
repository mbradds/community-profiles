import * as L from "leaflet";
import {
  featureStyles,
  htmlTableRow,
  toolTipHtml,
  addCustomControl,
} from "./util.js";

/**
 * Generates an HTML partial for the community pop-up information
 * @param {Object[]} landInfo Community information for the pop-up
 * @param {boolean} hasImage Specifies if the pop-up will have a traditional territory image
 * @returns {string} HTML partial to be added to the leaflet community pop-up
 */
function popUpTable(imgHtml, landInfo, hasImage) {
  let tableHtml = "";
  let subImageHtml = "";
  if (hasImage) {
    // subImageHtml += `<h3 class="center-header">Traditional Territory</h3>`;
    if (landInfo.MapLink) {
      subImageHtml += `<p>Image source:&nbsp;<a href="${landInfo.MapLink}" target="_blank">${landInfo.MapSource}</a></p>`;
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
    table += `<a class="center-header" href="${landInfo.Website}" target="_blank">Community Website</a>`;
  }
  [
    ["Leadership", landInfo.Leadership],
    ["Contact Person", landInfo.ContactPerson],
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
  tableHtml += table;
  tableHtml += imgHtml + subImageHtml;
  return tableHtml;
}

/**
 * Generates a leaflet featureLayer for the communities
 * @param {Object} map leaflet map object
 * @param {number} popHeight Height of the pop-up
 * @param {number} popWidth Width of the pop-up
 * @returns {Object} leaflet featureLayer for the communities
 */
export function addCommunityLayer(map, popHeight, popWidth, communityData) {
  function circleTooltip(landInfo) {
    const communityNames = !landInfo.Pronunciation
      ? landInfo.Name
      : `${landInfo.Name}&nbsp;(<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> <i>${landInfo.Pronunciation}</i>)`;

    const plural = landInfo.length > 1 ? "communities" : "community";
    return toolTipHtml(
      communityNames,
      `Circle represents approximate location of the ${plural}`,
      "Click to view full community info and traditional territory map"
    );
  }

  async function addCircles() {
    const landCircles = communityData.map((community) => {
      const com = community.attributes;
      const landMarker = L.circleMarker(
        [com.Latitude, com.Longitude],
        featureStyles.territory
      );
      landMarker.electionDate = com.NextElection
        ? new Date(com.NextElection)
        : null;
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
          maxHeight: `${popHeight}`,
          maxWidth: `${popWidth}`,
        }
      );
      return landMarker;
    });

    const setDisplayDays = (days) => {
      const display = document.getElementById("election-days-display");
      const displayDays =
        days === "All"
          ? days
          : `<strong style="color:${featureStyles.territoryElection.fillColor}";>${days} or less</strong>`;
      display.innerHTML = `<span>Days to election: (${displayDays})</span>`;
    };

    const communityLayer = L.featureGroup(landCircles);
    communityLayer.contactControl = addCustomControl("bottomright", map);

    communityLayer.resetSlider = function resetSlider() {
      document.getElementById("election-range-slider").value = "366";
      setDisplayDays("All");
    };

    communityLayer.resetStyle = function resetStyle() {
      Object.values(this._layers).forEach((circle) => {
        circle.setStyle({
          ...featureStyles.territory,
        });
      });
      this.resetSlider();
    };

    /**
     * Returns an alphabetically sorted list of all community names in the communityLayer
     * @returns {Object[]} [{id: _leaflet_id, name: string}]
     */
    communityLayer.getNames = function getNames() {
      return Object.values(this._layers)
        .map((circle) => ({
          name: circle.communityName,
          id: circle._leaflet_id,
        }))
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
    };

    /**
     * Zooms to the selected community by finding the matching id
     * @param {number} id leaflet id of the selected community circle
     */
    communityLayer.zoomToId = function zoomToId(id) {
      Object.values(this._layers).forEach((circle) => {
        if (circle._leaflet_id === id) {
          map.setView(circle._latlng, 10);
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
      const slider = document.getElementById("election-range-slider");
      slider.addEventListener("change", () => {
        const displayValue = slider.value > 365 ? "All" : slider.value;
        setDisplayDays(displayValue);
        this.filterElections(displayValue);
      });
    };

    /**
     * Evaluates each communities electionDate vs the current date
     * @param {number|string} dayRange Number between 0 and 365 or "All"
     */
    communityLayer.filterElections = function filterElections(dayRange) {
      this._map.legend.removeItem();
      const currentDate = Date.now();
      if (dayRange !== "All") {
        Object.values(this._layers).forEach((circle) => {
          let insideRange = false;
          if (circle.electionDate) {
            const daysUntilElection =
              (circle.electionDate.getTime() - currentDate) /
              (1000 * 3600 * 24);
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
     * Closes the map warning message, the contactControl popup and sets communities to the default color
     */
    communityLayer.resetSpreads = function resetSpreads() {
      map.warningMsg.removeWarning();
      this.contactControl.updateHtml("");
      Object.values(this._layers).forEach((circle) => {
        circle.setStyle({
          ...featureStyles.territory,
        });
      });
    };

    /**
     * Adds a leaflet control popup with community contact info
     * @param {Object[]} contacts [{name: string, contact: string}] contact info for the spread communities
     * @param {string} sprdName display name of the selected spread
     */
    communityLayer.spreadContactPopUp = function spreadContactPopUp(
      contacts,
      sprdName
    ) {
      map.youAreOn.updateHtml("");
      let contactsTable = `<table class="table">`;
      contactsTable += `<thead>
      <tr>
        <th scope="col">Community</th>
        <th scope="col">Contact</th>
      </tr>
    </thead>`;
      contactsTable += `<tbody>`;
      contacts.forEach((contact) => {
        contactsTable += `<tr><td>${contact.name}</td><td>${contact.contact}</td>`;
      });
      contactsTable += `</tbody>`;
      contactsTable += `</table>`;
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
     * @param {Array.<number>} selectedSpreads List of spread numbers that user has clicked on
     * @param {string} color Color code of the clicked spread. Changes the community circle color
     * @param {string} sprdName Display name of the spread
     */
    communityLayer.findSpreads = function findSpreads(
      selectedSpreads,
      color,
      sprdName
    ) {
      this.resetSlider();
      map.legend.removeItem();
      map.warningMsg.removeWarning();
      const zoomToLayer = [];
      const contactInfo = [];
      const noCommunities = () =>
        map.warningMsg.addWarning(
          `There are no communities identified for ${sprdName}`
        );
      if (selectedSpreads) {
        Object.values(this._layers).forEach((circle) => {
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
      this.getNames().forEach((name) => {
        options += `<option data-id=${name.id} label="" value="${name.name}"></option>`;
      });
      document.getElementById("find-communities-container").innerHTML = `
      <input type="text" id="community-search" name="community-search" list="suggestions" />
      <button class="btn btn-primary btn-xs header-btn" id="find-communities-btn">Find Community</button>
      <datalist id="suggestions">
      ${options}
      </datalist>
      <div id="community-search-error"></div>`;
      document
        .getElementById("find-communities-btn")
        .addEventListener("click", () => {
          const listItems = document.getElementById("suggestions");
          const listObj = document.getElementById("community-search");

          let foundId;
          Array.from(listItems.options).forEach((item) => {
            if (item.value === listObj.value) {
              foundId = parseInt(item.getAttribute("data-id"), 10);
            }
          });
          if (foundId) {
            this.resetSearchError();
            this.zoomToId(foundId);
          } else if (listObj.value !== "") {
            this.searchError("Cant find community");
          }
        });
    };

    /**
     * Binds an error warning next to the search function when the user input community cant be found
     * @param {string} message
     */
    communityLayer.searchError = function searchError(message) {
      document.getElementById(
        "community-search-error"
      ).innerHTML = `<div class="alert alert-danger"><span>${message}</span></div>`;
    };

    communityLayer.resetSearchError = function resetSearchError() {
      document.getElementById("community-search-error").innerHTML = "";
    };

    communityLayer.resetSearch = function resetSearch() {
      document.getElementById("community-search").value = "";
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
