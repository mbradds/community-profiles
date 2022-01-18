import landFeature from "../../company_data/EnbridgeNormanWells/poly1_min.json";
import landInfo from "../../company_data/EnbridgeNormanWells/landInfo.json";
import poly2Length from "../../company_data/EnbridgeNormanWells/poly2.json";
import incidentFeature from "../../company_data/EnbridgeNormanWells/events.json";
import terr from "../../company_data/EnbridgeNormanWells/terr.json";
import meta from "../../company_data/EnbridgeNormanWells/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
