import * as L from "leaflet";
import { CommunityFeature } from "./CommunityFeature";
import { HtmlControl } from "./MapControl";
import { featureStyles } from "../util";

export class BaseMap extends L.Map {
  warningMsg: HtmlControl;

  legend: HtmlControl;

  user: undefined | L.LatLng;

  youAreOn: HtmlControl;

  incidentLayer: undefined | L.FeatureGroup;

  constructor(
    div: string,
    config: {
      zoomDelta: number;
      initZoomTo: L.LatLng;
      initZoomLevel: number;
    }
  ) {
    super(div, config);
    this.setView(config.initZoomTo, config.initZoomLevel);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this);
    this.user = undefined;
    this.youAreOn = new HtmlControl("bottomright", this);
    this.warningMsg = new HtmlControl("bottomright", this);
    this.legend = new HtmlControl("topright", this, "", "legend");
    this.incidentLayer = undefined;
  }

  addResetBtn() {
    return new HtmlControl(
      "bottomleft",
      this,
      `<button type="button" id="find-me" class="btn btn-primary btn-block btn-lg">Find Me</button><button type="button" id="reset-map" class="btn btn-primary btn-block btn-lg">Reset Map</button>`
    );
  }

  resetZoom(communityLayer: CommunityFeature) {
    this.flyToBounds(communityLayer.featureGroup.getBounds(), {
      duration: 0.25,
      easeLinearity: 1,
    });
  }

  removeIncidents() {
    this.legend.removeHtmlItem("legend-temp");
    if (this.incidentLayer) {
      this.incidentLayer.clearLayers();
    }
  }

  resetListener(communityLayer: CommunityFeature) {
    const resetMapElement = document.getElementById("reset-map");
    if (resetMapElement) {
      resetMapElement.addEventListener("click", () => {
        this.removeIncidents();
        this.closePopup();
        this.youAreOn.removeHtml();
        communityLayer.reset();
        this.resetZoom(communityLayer);
      });
    }
  }

  addLayerControl(layers: { display: string; layer: L.Layer }[]) {
    const layerControl: { [key: string]: L.Layer } = {};
    layers.forEach((layer) => {
      layerControl[layer.display] = layer.layer;
    });
    L.control
      .layers(undefined, layerControl, { position: "topleft" })
      .addTo(this);
  }

  addMapLegend(communityLayer: CommunityFeature): HtmlControl {
    let legend = `<h4><span class="region-click-text" 
    style="height: 10px; background-color: ${featureStyles.reserveOverlap.fillColor}">
    &nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;First Nations Reserve</h4>`;

    if (communityLayer) {
      legend += `<h4 style='color:${featureStyles.mainline.color};'>&#9473;&#9473; Existing Mainline</h4>`;
      legend += `<h4 style='color:${featureStyles.territory.fillColor};'>&#11044; Community</h4>`;
    }
    this.legend.updateHtml(legend);
    return this.legend;
  }

  async findUser() {
    return new Promise((resolve, reject) => {
      this.locate({
        watch: false,
      })
        .on("locationfound", (e: any) => {
          const marker: L.Marker = L.marker([e.latitude, e.longitude], {
            draggable: true,
          }).bindPopup("Click and drag to move locations");
          marker.on("drag", (d) => {
            this.user = d.target.getLatLng();
          });
          // marker.id = "userLocation";
          this.addLayer(marker);
          this.user = marker.getLatLng();
          resolve(marker);
        })
        .on("locationerror", (err: any) => {
          this.user = undefined;
          reject(err);
        });
    });
  }
}
