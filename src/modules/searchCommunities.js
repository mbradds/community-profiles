// import * as L from "leaflet";

export function searchCommunities(map, searchLayer) {
  let options = "";
  searchLayer.getNames().forEach((name) => {
    options += `<option data-id=${name.id} label="" value="${name.name}"></option>`;
  });
  document.getElementById("find-communities-container").innerHTML = `
  <input type="text" id="community-search" name="community-search" list="suggestions" />
  <button id="find-communities-btn">Find Community</button>
  <datalist id="suggestions">
  ${options}
  </datalist>`;
  //   const searchBox = L.control({ position: "topright" });
  //   searchBox.onAdd = function () {
  //     this._div = L.DomUtil.create("div");
  //     this._div.innerHTML = `
  //     <input type="text" id="community-search" name="community-search" list="suggestions" />
  //     <button id="find-communities-btn">Find Community</button>
  //     <datalist id="suggestions">
  //     ${options}
  //     </datalist>`;
  //     return this._div;
  //   };
  //   searchBox.addTo(map);
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
      //   console.log(listObj.value, foundId);
      if (foundId) {
        searchLayer.zoomToId(foundId);
      }
    });
}
