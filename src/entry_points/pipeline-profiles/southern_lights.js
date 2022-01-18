import landFeature from "../../company_data/SouthernLightsPipeline/poly1_min.json";
import landInfo from "../../company_data/SouthernLightsPipeline/landInfo.json";
import poly2Length from "../../company_data/SouthernLightsPipeline/poly2.json";
import incidentFeature from "../../company_data/SouthernLightsPipeline/events.json";
import terr from "../../company_data/SouthernLightsPipeline/terr.json";
import meta from "../../company_data/SouthernLightsPipeline/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
