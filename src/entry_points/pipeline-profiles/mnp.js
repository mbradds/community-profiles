import landFeature from "../../company_data/Maritimes&NortheastPipelineManagementLtd/poly1_min.json";
import landInfo from "../../company_data/Maritimes&NortheastPipelineManagementLtd/landInfo.json";
import poly2Length from "../../company_data/Maritimes&NortheastPipelineManagementLtd/poly2.json";
import incidentFeature from "../../company_data/Maritimes&NortheastPipelineManagementLtd/events.json";
import terr from "../../company_data/Maritimes&NortheastPipelineManagementLtd/terr.json";
import meta from "../../company_data/Maritimes&NortheastPipelineManagementLtd/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);