import landFeature from "../../company_data/WestcoastEnergyInc/poly1_min.json";
import landInfo from "../../company_data/WestcoastEnergyInc/landInfo.json";
import poly2Length from "../../company_data/WestcoastEnergyInc/poly2.json";
import incidentFeature from "../../company_data/WestcoastEnergyInc/events.json";
import terr from "../../company_data/WestcoastEnergyInc/terr.json";
import meta from "../../company_data/WestcoastEnergyInc/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
