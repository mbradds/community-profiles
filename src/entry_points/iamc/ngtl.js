import landFeature from "../../company_data/NOVAGasTransmissionLtd/poly1_min.json";
import landInfo from "../../company_data/NOVAGasTransmissionLtd/landInfo.json";
import poly2Length from "../../company_data/NOVAGasTransmissionLtd/poly2.json";
import incidentFeature from "../../company_data/NOVAGasTransmissionLtd/events.json";
import meta from "../../company_data/NOVAGasTransmissionLtd/meta.json";
import { landDashboard } from "../../modules/iamc.js";

landDashboard(landFeature, landInfo, poly2Length, incidentFeature, meta);
