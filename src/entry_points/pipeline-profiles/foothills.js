import landFeature from "../../company_data/FoothillsPipeLinesLtd/poly1_min.json";
import landInfo from "../../company_data/FoothillsPipeLinesLtd/landInfo.json";
import poly2Length from "../../company_data/FoothillsPipeLinesLtd/poly2.json";
import incidentFeature from "../../company_data/FoothillsPipeLinesLtd/events.json";
import terr from "../../company_data/FoothillsPipeLinesLtd/terr.json";
import meta from "../../company_data/FoothillsPipeLinesLtd/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);