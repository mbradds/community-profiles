import landFeature from "../../company_data/MontrealPipeLineLimited/poly1_min.json";
import landInfo from "../../company_data/MontrealPipeLineLimited/landInfo.json";
import poly2Length from "../../company_data/MontrealPipeLineLimited/poly2.json";
import incidentFeature from "../../company_data/MontrealPipeLineLimited/events.json";
import terr from "../../company_data/MontrealPipeLineLimited/terr.json";
import meta from "../../company_data/MontrealPipeLineLimited/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
