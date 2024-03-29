import * as L from "leaflet";
import { BaseMap } from "./BaseMap";

interface MapControl extends L.Control {
  _div: HTMLElement;
}

export class HtmlControl {
  info: MapControl;

  constructor(
    position: L.ControlPosition,
    map: BaseMap,
    initialHtml = "",
    className = ""
  ) {
    this.info = new L.Control({ position }) as MapControl;
    if (className !== "") {
      this.info._div = L.DomUtil.create("div", className);
    } else {
      this.info._div = L.DomUtil.create("div");
    }
    this.info.onAdd = function () {
      if (initialHtml !== "") {
        this._div.innerHTML = initialHtml;
      }
      return this._div;
    };
    if (map) {
      this.info.addTo(map);
    }
  }

  addWarning(text: string) {
    this.info._div.innerHTML = `<div class="alert alert-danger"><span class="h3 mrgn-bttm-0 user-warning-text">${text}</span><button title="Dismiss" class="mfp-close content-dismiss rid-error" type="button">×<span class="wb-inv"> Dismiss</span></button></div>`;
  }

  removeHtml() {
    this.info._div.innerHTML = "";
  }

  updateHtml(html: string) {
    this.info._div.innerHTML = html;
  }

  addToHtml(html: string) {
    this.info._div.innerHTML += html;
  }

  removeHtmlItem(className: string) {
    Array.from(this.info._div.getElementsByClassName(className)).forEach(
      (toHide) => {
        if (toHide.parentNode) {
          toHide.parentNode.removeChild(toHide);
        }
      }
    );
  }

  closeBtnListener(closeId: string) {
    const closeBtn = document.getElementById(closeId);
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.removeHtml();
      });
    }
  }

  /**
   * Add a wet4 info section to the control
   * @param sectionId HTML id for the section
   * @param closeBtnId HTML id for the close button
   * @param header Section header text
   * @param bodyHtml HTML partial for the panel body
   * @param footer Optional paragraph text below the bodyHtml
   */
  addSection(
    sectionId: string,
    closeBtnId: string,
    header: string,
    bodyHtml: string,
    footer: string
  ) {
    this.updateHtml(`<section class="panel panel-default" id="${sectionId}">
        <header class="panel-heading">
         <h5 class="panel-title header-text">${header}</h5>
         <div class="pull-right header-btn">
         <button
           type="button"
           class="btn btn-primary btn-xs"
           id="${closeBtnId}"
         >
         Close
         </button>
       </div>
        </header>
        <div class="panel-body">
         ${bodyHtml}
         <p style="margin-bottom:0px;">${footer}</p>
        </div>
      </section>`);
  }

  static fixScroll(popUpId: string) {
    const popUpDiv = L.DomUtil.get(popUpId);
    if (popUpDiv) {
      L.DomEvent.on(popUpDiv, "mousewheel", L.DomEvent.stopPropagation);
    }
  }
}
