import landFeature from "../../company_data/AlliancePipelineLtd/poly1_min.json";
import landInfo from "../../company_data/AlliancePipelineLtd/landInfo.json";
import poly2Length from "../../company_data/AlliancePipelineLtd/poly2.json";
import incidentFeature from "../../company_data/AlliancePipelineLtd/events.json";
import terr from "../../company_data/AlliancePipelineLtd/terr.json";
import meta from "../../company_data/AlliancePipelineLtd/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
