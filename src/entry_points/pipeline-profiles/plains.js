import landFeature from "../../company_data/PlainsMidstreamCanadaULC/poly1_min.json";
import landInfo from "../../company_data/PlainsMidstreamCanadaULC/landInfo.json";
import poly2Length from "../../company_data/PlainsMidstreamCanadaULC/poly2.json";
import incidentFeature from "../../company_data/PlainsMidstreamCanadaULC/events.json";
import terr from "../../company_data/PlainsMidstreamCanadaULC/terr.json";
import meta from "../../company_data/PlainsMidstreamCanadaULC/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);