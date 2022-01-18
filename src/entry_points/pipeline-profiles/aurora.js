import landFeature from "../../company_data/AuroraPipeLineCompanyLtd/poly1_min.json";
import landInfo from "../../company_data/AuroraPipeLineCompanyLtd/landInfo.json";
import poly2Length from "../../company_data/AuroraPipeLineCompanyLtd/poly2.json";
import incidentFeature from "../../company_data/AuroraPipeLineCompanyLtd/events.json";
import terr from "../../company_data/AuroraPipeLineCompanyLtd/terr.json";
import meta from "../../company_data/AuroraPipeLineCompanyLtd/meta.json";
import { profile } from "../../modules/pipeline-profiles.js";

profile(landFeature, landInfo, poly2Length, incidentFeature, terr, meta);