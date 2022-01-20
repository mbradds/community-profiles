export const tutorialText = {
  imageSections: {
    zoom: {
      paragraphs: [
        "In addition to using the zoom options above, the map has <strong>+</strong> and <strong>-</strong> buttons that can be clicked to zoom in and out.",
        "The <i>layer</i> button directly below the <strong>+</strong> and <strong>-</strong> buttons can be used to filter map layers to make it less cluttered if certain map layers are not required.",
      ],
      path: "/images/tutorial/map-navigation.png",
      width: 318,
      height: 204,
    },
    fullscreen: {
      paragraphs: [
        "It is highly recommended to use the fullscreen option when using the application.",
      ],
      path: "/images/tutorial/fullscreen.png",
      width: 242,
      height: 103,
    },
    reset: {
      paragraphs: [
        "The <i>Reset Map</i> button can be used at anytime during map navigation to re-zoom to the initial starting point. This button will also clear and reset any changes/pop-ups that appear during the use of the app.",
      ],
      path: "/images/tutorial/reset-map.png",
      width: 221,
      height: 112,
    },
    communityTooltip: {
      paragraphs: [
        "When hovering over a community circle, a tooltip will appear with some preliminary information. The community name is listed at the top in bold, and if available, the phonetic information will apear in brackets next to the name indicating the proper way to sound out the community name.",
        "When hovering over a community, the tooltip gives an indication that you can click directly on the circle to view additional information about the community. See additional instructions below.",
      ],
      path: "/images/tutorial/community-tooltip.png",
      width: 393,
      height: 293,
    },
    communityPopup: {
      paragraphs: [
        "When a grey circle is clicked, a pop-up will appear containing information corresponding to that community. Be sure to scroll down while hovering over the pop-up to view all the information.",
        "There are several options to close the pop-up and continue using the app:",
        "1. Click the small x button in the upper right corner of the pop-up.",
        "2. Click somewhere else on the map, outside of the pop-up.",
        "3. Click the <i>Reset Map</i> button.",
      ],
      path: "/images/tutorial/community-popup.png",
      width: 469,
      height: 428,
    },
    kpTooltip: {
      paragraphs: [
        "Kilometer Posts (KP) are represented on the map as transparent maroon circles overlayed on top of the centerline. Hover over a KP to view the KP number and the project spread that the KP belongs to.",
        "You can click on a KP to isolate the communities specific to that project spread. Once a KP is clicked, the map will zoom to fit all the communities for that spread, and the circles for these communities will change color to light blue. At this point, you can click on the <i>Reset Map</i> button or click on another KP to continue using the app.",
      ],
      path: "/images/tutorial/kp-tooltip.png",
      width: 259,
      height: 194,
    },
    reserveTooltip: {
      paragraphs: [
        "You will need to zoom in on the map much closer to accurately interact with this layer.",
        "When hovering over a First Nations Reserve, a tooltip will appear with some preliminary information. The <i>Total overlap</i> number indicates the the total length of regulated assets that pass through the reserve boundary (TMX and existing mainline). You can then click on the reserve to view more information. See additional instructions below.",
      ],
      path: "/images/tutorial/reserve-tooltip.png",
      width: 403,
      height: 302,
    },
    reservePopup: {
      paragraphs: [
        "Clicking on a First Nations Reserve opens a pop-up with a breakdown of the pipeline overlaps with the reserve boundary, as well as nearby incidents.",
        "If there are incidents within the reserve boundaries, or within 15km of the reserve boundary, they will appear as red circles on the map. These incidents are specific to the reserve that was just clicked. You can hover over the incident circle to view additional information about the incident. The red circles will remain on the map until another reserve is clicked, or the <i>Reset Map</i> button is clicked.",
        'The incident data is sourced from CER, and is available on <a href="https://open.canada.ca/data/en/dataset/fd17f08f-f14d-433f-91df-c90a34e1e9a6" target="_blank" rel="noopener noreferrer">Open Government</a>',
      ],
      path: "/images/tutorial/reserve-popup.png",
      width: 448,
      height: 336,
    },
  },
};
