import landFeature from "../../company_data/EnbridgeBakkenSystem/poly1_min.json";
import landInfo from "../../company_data/EnbridgeBakkenSystem/landInfo.json";
import poly2Length from "../../company_data/EnbridgeBakkenSystem/poly2.json";
import incidentFeature from "../../company_data/EnbridgeBakkenSystem/events.json";
import terr from "../../company_data/EnbridgeBakkenSystem/terr.json";
import meta from "../../company_data/EnbridgeBakkenSystem/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);