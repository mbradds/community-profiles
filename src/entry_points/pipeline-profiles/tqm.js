import landFeature from "../../company_data/TransQuebecandMaritimesPipelineInc/poly1_min.json";
import landInfo from "../../company_data/TransQuebecandMaritimesPipelineInc/landInfo.json";
import poly2Length from "../../company_data/TransQuebecandMaritimesPipelineInc/poly2.json";
import incidentFeature from "../../company_data/TransQuebecandMaritimesPipelineInc/events.json";
import terr from "../../company_data/TransQuebecandMaritimesPipelineInc/terr.json";
import meta from "../../company_data/TransQuebecandMaritimesPipelineInc/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);