<h1 align="center">Community Profiles</h1>

<div align="center">
  <!-- contributors welcome -->
  <a>
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="Contributors" />
  </a>
  <!-- Known Vulnerabilities -->
  <a>
    <img src="https://snyk.io/test/github/mbradds/community-profiles/badge.svg?targetFile=package.json" alt="Vulnerabilities" />
  </a>
  <!-- Website up -->
  <a>
    <img src="https://img.shields.io/website?down_color=red&down_message=down&up_color=green&up_message=up&url=https://www.iamc-tmx-community-profiles.ca/" alt="heroku" />
  </a>
</div>

<div align="center">
  <h3>
    <a href="https://www.iamc-tmx-community-profiles.ca/">
      Website
    </a>
    <span> | </span>
    <a href="https://www.iamc-tmx-community-profiles.ca/tutorial.html">
      Tutorial
    </a>
  </h3>
</div>

This project is a joint development effort between the CER and the TMX-IAMC. The web app is designed to be used by Indigenous and Non-Indigenous monitors and inspectors in the field. Features such as geo-location and map layers containing community information and activities such as incidents can assist with Indigenous consulation and activities related to the development of the TMX expansion project and the existing mainline.

## Quick start

### Step 1 - set up backend data prep

The backend data preperation/compilation uses conda and a specific environment (community-profiles) specified in the `environment.yml` file. In order to set up the data and run the project locally you will need to create this conda env:

```bash
conda env create --file=environment.yml
```

Alot of the node script commands require this named conda env.

Some of the raw data `src/data_management/raw_data` is untracked because the files are very large. The following node script commands can be run to get these files from StatsCan and the CER:

1.

```bash
npm run get-map-data
```

This downloads and unzips the latest Canada base map files as well as the First Nations Reserve boundary files and metadata.

2.

```bash
npm run get-cer-data
```

This downloads the latest CER incident data from Open Government (updated monthly).

3.

```bash
npm run get-tm-data
```

This downloads the latest geojson pipeline asset data (TMX & Existing Mainline) from the Trans Mountain website.

4.

```bash
npm run traditional-territory-update
```

This gets the latest traditional territory files from native-land.ca and isolates the Canadian specific territories.

Once all the data is in place, the following commands can be run to compile the data into a usable output for display in the front end:

1.

```bash
npm run gis && npm run minify-maps
```

This overlays the First Nations Reserve boundary file with the Trans Mountain asset data to find overlaps. The output files are slightly minimized and prepared with the proper CRS.

2.

```bash
npm run community-update && npm run images
```

This gets the latest community data `src/data_management/raw_data/traditional_territory/*.xlsx` for Alberta and BC. The data is prepared into a json file here: `src/company_data/community_profiles/community_info.json`. The raw traditional territory images `src/data_management/raw_data/traditional_territory/input_maps` are minimized and sized properly for use in the app.

### Step 2 - set up frontend map

```bash
npm install
```

```bash
npm run dev
```

or

```bash
npm run build
```
