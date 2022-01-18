import landFeature from "../../company_data/ManyIslandsPipeLines(Canada)Limited/poly1_min.json";
import landInfo from "../../company_data/ManyIslandsPipeLines(Canada)Limited/landInfo.json";
import poly2Length from "../../company_data/ManyIslandsPipeLines(Canada)Limited/poly2.json";
import incidentFeature from "../../company_data/ManyIslandsPipeLines(Canada)Limited/events.json";
import terr from "../../company_data/ManyIslandsPipeLines(Canada)Limited/terr.json";
import meta from "../../company_data/ManyIslandsPipeLines(Canada)Limited/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);