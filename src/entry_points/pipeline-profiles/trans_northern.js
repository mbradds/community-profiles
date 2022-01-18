import landFeature from "../../company_data/Trans-NorthernPipelinesInc/poly1_min.json";
import landInfo from "../../company_data/Trans-NorthernPipelinesInc/landInfo.json";
import poly2Length from "../../company_data/Trans-NorthernPipelinesInc/poly2.json";
import incidentFeature from "../../company_data/Trans-NorthernPipelinesInc/events.json";
import terr from "../../company_data/Trans-NorthernPipelinesInc/terr.json";
import meta from "../../company_data/Trans-NorthernPipelinesInc/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);
