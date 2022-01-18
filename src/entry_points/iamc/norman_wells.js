import landFeature from "../../company_data/EnbridgeNormanWells/poly1_min.json";
import landInfo from "../../company_data/EnbridgeNormanWells/landInfo.json";
import poly2Length from "../../company_data/EnbridgeNormanWells/poly2.json";
import incidentFeature from "../../company_data/EnbridgeNormanWells/events.json";
import meta from "../../company_data/EnbridgeNormanWells/meta.json";
import { landDashboard } from "../../modules/iamc.js";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
