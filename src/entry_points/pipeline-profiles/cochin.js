import landFeature from "../../company_data/PKMCochinULC/poly1_min.json";
import landInfo from "../../company_data/PKMCochinULC/landInfo.json";
import poly2Length from "../../company_data/PKMCochinULC/poly2.json";
import incidentFeature from "../../company_data/PKMCochinULC/events.json";
import terr from "../../company_data/PKMCochinULC/terr.json";
import meta from "../../company_data/PKMCochinULC/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);