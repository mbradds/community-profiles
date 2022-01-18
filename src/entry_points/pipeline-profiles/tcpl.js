import landFeature from "../../company_data/TransCanadaPipeLinesLimited/poly1_min.json";
import landInfo from "../../company_data/TransCanadaPipeLinesLimited/landInfo.json";
import poly2Length from "../../company_data/TransCanadaPipeLinesLimited/poly2.json";
import incidentFeature from "../../company_data/TransCanadaPipeLinesLimited/events.json";
import terr from "../../company_data/TransCanadaPipeLinesLimited/terr.json";
import meta from "../../company_data/TransCanadaPipeLinesLimited/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
