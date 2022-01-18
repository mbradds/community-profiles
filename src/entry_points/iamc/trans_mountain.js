import landFeature from "../../company_data/TransMountainPipelineULC/poly1_min.json";
import landInfo from "../../company_data/TransMountainPipelineULC/landInfo.json";
import poly2Length from "../../company_data/TransMountainPipelineULC/poly2.json";
import incidentFeature from "../../company_data/TransMountainPipelineULC/events.json";
import meta from "../../company_data/TransMountainPipelineULC/meta.json";
import line from "../../company_data/TransMountainPipelineULC/tmx.json";
// import territory from "../../company_data/TransMountainPipelineULC/territory.json";
import { landDashboard } from "../../modules/iamc.js";

landDashboard(
  landFeature,
  landInfo,
  poly2Length,
  incidentFeature,
  meta,
  line,
  false
);
