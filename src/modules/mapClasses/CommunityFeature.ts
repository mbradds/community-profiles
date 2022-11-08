import * as L from "leaflet";
import { featureStyles, calculateDaysUntil } from "../util";
import { BaseMap } from "./BaseMap";
import { CommunityCircle } from "./CommunityCircle";
import { HtmlControl } from "./MapControl";

interface CommunityName {
  name: string;
  id: number | null | undefined;
}

type ContactInfo = {
  name: string;
  contact: string | null;
};

export class CommunityFeature {
  contactControl: HtmlControl;

  electionRangeSliderDiv: HTMLElement | null;

  featureGroup: L.FeatureGroup;

  map: BaseMap;

  constructor(circles: CommunityCircle[], map: BaseMap) {
    this.map = map;
    this.featureGroup = L.featureGroup(circles);
    this.contactControl = new HtmlControl("bottomright", map);
    // this.errorControl = new HtmlControl("topleft", map);
    this.electionRangeSliderDiv = document.getElementById(
      "election-range-slider"
    );
    this.featureGroup.addTo(this.map);
  }

  static setDisplayDays(days: string) {
    const displayDays =
      days === "All"
        ? days
        : `<strong style="color:${featureStyles.territoryElection.fillColor}";>${days} or less</strong>`;

    const displayDaysElement = document.getElementById("election-days-display");
    if (displayDaysElement) {
      displayDaysElement.innerHTML = `<span>Days to election: (${displayDays})</span>`;
    }
  }

  resetSlider() {
    (<HTMLInputElement>this.electionRangeSliderDiv).value = "366";
    CommunityFeature.setDisplayDays("All");
  }

  resetStyle() {
    this.featureGroup.setStyle({
      ...featureStyles.territory,
    });
    this.resetSlider();
  }

  /**
   * Returns an alphabetically sorted list of all community names in the communityLayer
   * @returns [{id: _leaflet_id, name: string}]
   */
  getNames(): CommunityName[] {
    return this.featureGroup
      .getLayers()
      .map((communityCircle) => {
        const circle = communityCircle as CommunityCircle;
        return { name: circle.communityName, id: circle._leaflet_id };
      })
      .sort((a: CommunityName, b: CommunityName) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
  }

  /**
   * Zooms to the selected community by finding the matching id
   * @param id leaflet id of the selected community circle
   */
  zoomToId(id: number) {
    this.featureGroup.eachLayer((communityCircle) => {
      const circle = communityCircle as CommunityCircle;
      if (circle._leaflet_id === id) {
        this.map.setView(
          circle.getLatLng(),
          this.map.getZoom() > 10 ? this.map.getZoom() : 10
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
  }

  /**
   * Evaluates each communities electionDate vs the current date
   * @param dayRange Number between 0 and 365 or "All"
   */
  filterElections(dayRange: string) {
    this.map.legend.removeHtmlItem("legend-temp");
    if (dayRange !== "All") {
      this.featureGroup.eachLayer((communityCircle) => {
        const circle = communityCircle as CommunityCircle;
        let insideRange = false;
        if (circle.electionDate instanceof Date) {
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
  }

  /**
   * Adds an event listener to the election range slider and fires the filterElections method
   */
  electionRangeListener() {
    CommunityFeature.setDisplayDays("All");
    const slider = <HTMLInputElement>(
      document.getElementById("election-range-slider")
    );
    slider.addEventListener("change", () => {
      const displayValue = parseInt(slider.value) > 365 ? "All" : slider.value;
      CommunityFeature.setDisplayDays(displayValue);
      this.filterElections(displayValue);
    });
  }

  /**
   * Adds a leaflet control popup with community contact info
   * @param contacts [{name: string, contact: string}] contact info for the spread communities
   * @param sprdName display name of the selected spread
   */
  spreadContactPopUp(contacts: ContactInfo[], sprdName: string) {
    this.map.youAreOn.updateHtml("");
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
    HtmlControl.fixScroll("spread-contacts");
    this.contactControl.closeBtnListener("close-spread-contacts");
  }

  /**
   * Finds all communities in the communityLayer that belong to a selected project spread
   * @param selectedSpreads List of spread numbers that user has clicked on
   * @param color Color code of the clicked spread. Changes the community circle color
   * @param sprdName Display name of the spread
   */
  findSpreads(selectedSpreads: number[], color: string, sprdName: string) {
    this.resetSlider();
    this.map.legend.removeHtmlItem("legend-temp");
    this.map.warningMsg.removeHtml();
    const zoomToLayer: CommunityCircle[] = [];
    const contactInfo: ContactInfo[] = [];
    const noCommunities = () =>
      this.map.warningMsg.addWarning(
        `There are no communities identified for ${sprdName}`
      );
    if (selectedSpreads) {
      this.featureGroup.eachLayer((communityCircle) => {
        const circle = communityCircle as CommunityCircle;
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
      this.map.fitBounds(L.featureGroup(zoomToLayer).getBounds());
      this.map.legend.addToHtml(
        `<h4 class="legend-temp" style='color:${color};'>&#11044; Spread ${selectedSpreads} communities</h4>`
      );
      this.spreadContactPopUp(contactInfo, sprdName);
    } else {
      noCommunities();
    }
  }

  resetSearch() {
    (<HTMLInputElement>document.getElementById("community-search")).value = "";
    this.map.warningMsg.removeHtml();
  }

  /**
   * Adds an event listener to the find community search function
   */
  searchCommunities() {
    let options = "";
    this.getNames().forEach((name: CommunityName) => {
      options += `<option data-id=${name.id} label="" value="${name.name}"></option>`;
    });
    const listItems = <HTMLSelectElement>document.getElementById("suggestions");
    if (listItems) {
      listItems.innerHTML = `${options}`;
    }

    const findComBtnElement = document.getElementById("find-communities-btn");
    if (findComBtnElement) {
      findComBtnElement.addEventListener("click", () => {
        const listObj = <HTMLInputElement>(
          document.getElementById("community-search")
        );
        let foundId;
        Array.from(listItems.options).forEach((item) => {
          if (item.value === listObj.value) {
            const btnId = item.getAttribute("data-id");
            if (btnId) {
              foundId = parseInt(btnId);
            }
          }
        });
        if (foundId) {
          this.map.warningMsg.removeHtml();
          this.zoomToId(foundId);
        } else if (listObj.value !== "") {
          this.map.warningMsg.addWarning(
            "Cant find community. Try using the drop down list to select a community and then click the Find Community button."
          );
        }
      });
    }
  }

  /**
   * Closes the map warning message, the contactControl popup and sets communities to the default color
   */
  resetSpreads() {
    this.map.warningMsg.removeHtml();
    this.contactControl.updateHtml("");
    this.featureGroup.setStyle({
      ...featureStyles.territory,
    });
  }

  /**
   * Resets community spreads, styles, and search
   */
  reset() {
    this.resetSpreads();
    this.resetStyle();
    this.resetSearch();
  }
}
