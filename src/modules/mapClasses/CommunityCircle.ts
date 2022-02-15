import * as L from "leaflet";
import { CommunityAttr } from "../interfaces";

export class CommunityCircle extends L.CircleMarker {
  electionDate: Date | string | null;

  spreadNums: [number | null];

  communityName: string;

  contactInfo: string | null;

  _leaflet_id?: number;

  constructor(
    location: [number, number],
    options: any,
    communityInfo: CommunityAttr
  ) {
    super(location, options);
    this.electionDate = communityInfo.NextElection;
    this.spreadNums = [communityInfo.ProjectSpreadNumber];
    this.communityName = communityInfo.Name;
    this.contactInfo = communityInfo.ContactInformation;
  }
}
