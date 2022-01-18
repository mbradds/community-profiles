import landFeature from "../../company_data/KingstonMidstreamWestspurLimited/poly1_min.json";
import landInfo from "../../company_data/KingstonMidstreamWestspurLimited/landInfo.json";
import poly2Length from "../../company_data/KingstonMidstreamWestspurLimited/poly2.json";
import incidentFeature from "../../company_data/KingstonMidstreamWestspurLimited/events.json";
import terr from "../../company_data/KingstonMidstreamWestspurLimited/terr.json";
import meta from "../../company_data/KingstonMidstreamWestspurLimited/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);