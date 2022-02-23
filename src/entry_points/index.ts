import landFeature from "../company_data/TransMountainPipelineULC/poly1.min.json";
import landInfo from "../company_data/TransMountainPipelineULC/landInfo.json";
import incidentFeature from "../company_data/TransMountainPipelineULC/events.json";
import { iamcDashboard } from "../modules/iamcDashboard";

iamcDashboard(landFeature, landInfo, incidentFeature);
