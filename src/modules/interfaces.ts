export interface MapWarning extends L.Control {
  addWarning?: Function;
  removeWarning?: Function;
}

export interface IamcMap extends L.Map {
  warningMsg?: MapWarning;
  legend?: any;
  youAreOn?: any;
  user?: L.LatLng;
}

export interface CommunityAttr {
  Address: string | null;
  ConcernsOrIssues: string | null;
  ContactInformation: string | null;
  ContactPerson: string | null;
  EmergencyManagementContact: string | null;
  History: string | null;
  IndigenousMonitors: string | null;
  IndigenousStudy: string | null;
  Latitude: number;
  Leadership: string | null;
  Longitude: number;
  MapFile: string | null;
  MapLink: string | null;
  MapSource: string | null;
  Name: string;
  NextElection: string | null | Date;
  ProjectSpreadNumber: number | null;
  ProjectSpreads: string | null;
  Pronunciation: string | null;
  Protocol: string | null;
  ShowOnMap: boolean;
  TraditionalTerritoryLink: string | null;
  Website: string | null;
  createdAt: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface CommunityLayer extends L.FeatureGroup {
  contactControl?: any;
  resetSlider?: Function;
  resetStyle?: Function;
  getNames?: Function;
  zoomToId?: Function;
  electionRangeListener?: Function;
  filterElections?: Function;
  resetSpreads?: Function;
  spreadContactPopUp?: Function;
  findSpreads?: Function;
  searchCommunities?: Function;
  searchError?: Function;
  resetSearchError?: Function;
  resetSearch?: Function;
  reset?: Function;
}

export interface CommunityCircle extends L.CircleMarker {
  communityName: string;
  _leaflet_id?: number;
  electionDate: Date;
  spreadNums: number[];
  contactInfo: string | null;
}
