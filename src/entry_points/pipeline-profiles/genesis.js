import landFeature from "../../company_data/GenesisPipelineCanadaLtd/poly1_min.json";
import landInfo from "../../company_data/GenesisPipelineCanadaLtd/landInfo.json";
import poly2Length from "../../company_data/GenesisPipelineCanadaLtd/poly2.json";
import incidentFeature from "../../company_data/GenesisPipelineCanadaLtd/events.json";
import terr from "../../company_data/GenesisPipelineCanadaLtd/terr.json";
import meta from "../../company_data/GenesisPipelineCanadaLtd/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);