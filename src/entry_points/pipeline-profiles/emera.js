import landFeature from "../../company_data/EmeraBrunswickPipelineCompanyLtd/poly1_min.json";
import landInfo from "../../company_data/EmeraBrunswickPipelineCompanyLtd/landInfo.json";
import poly2Length from "../../company_data/EmeraBrunswickPipelineCompanyLtd/poly2.json";
import incidentFeature from "../../company_data/EmeraBrunswickPipelineCompanyLtd/events.json";
import terr from "../../company_data/EmeraBrunswickPipelineCompanyLtd/terr.json";
import meta from "../../company_data/EmeraBrunswickPipelineCompanyLtd/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);