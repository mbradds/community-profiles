import landFeature from "../../company_data/VectorPipelineLimitedPartnership/poly1_min.json";
import landInfo from "../../company_data/VectorPipelineLimitedPartnership/landInfo.json";
import poly2Length from "../../company_data/VectorPipelineLimitedPartnership/poly2.json";
import incidentFeature from "../../company_data/VectorPipelineLimitedPartnership/events.json";
import terr from "../../company_data/VectorPipelineLimitedPartnership/terr.json";
import meta from "../../company_data/VectorPipelineLimitedPartnership/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);