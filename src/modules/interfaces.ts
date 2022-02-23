import { HtmlControl } from "./mapClasses/MapControl";

export interface MapLegendControl extends L.Control {
  _div?: HTMLDivElement;
  addItem?: Function;
  removeItem?: Function;
}

export interface IamcMap extends L.Map {
  warningMsg?: HtmlControl;
  legend?: MapLegendControl;
  youAreOn?: HtmlControl;
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

export interface IncidentInfo {
  distance: number;
  id: string;
  landId: string;
  loc: number[];
  status: string;
  sub: string;
  type: string;
  vol: number | null;
  what: string;
  why: string;
}
