import landFeature from "../company_data/TransMountainPipelineULC/poly1_min.json";
import landInfo from "../company_data/TransMountainPipelineULC/landInfo.json";
import poly2Length from "../company_data/TransMountainPipelineULC/poly2.json";
import incidentFeature from "../company_data/TransMountainPipelineULC/events.json";
import meta from "../company_data/TransMountainPipelineULC/meta.json";
import { iamcDashboard } from "../modules/iamcDashboard.js";

iamcDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
