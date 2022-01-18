import landFeature from "../../company_data/EnbridgePipelinesInc/poly1_min.json";
import landInfo from "../../company_data/EnbridgePipelinesInc/landInfo.json";
import poly2Length from "../../company_data/EnbridgePipelinesInc/poly2.json";
import incidentFeature from "../../company_data/EnbridgePipelinesInc/events.json";
import terr from "../../company_data/EnbridgePipelinesInc/terr.json";
import meta from "../../company_data/EnbridgePipelinesInc/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
