export enum Party {
  DEMOCRAT = 'Démocrate',
  REPUBLICAN = 'Républicain',
}

export type MapViewMode = 'geo' | 'cartogram';
export type ColorMode = 'solid' | 'margins';

export interface CandidateResult {
  name: string;
  party: Party;
  popularVotes: number;
}

export interface StateData {
  stateCode: string;
  stateName: FrenchedStateName;
  electoralVotes: number;
  results: CandidateResult[];
}

export interface ElectionYearData {
  year: number;
  data: StateData[];
}

export interface StateHistoryPoint {
  year: number;
  winner: Party | null;
  democratVotes: number;
  republicanVotes: number;
  democratPercentage: number;
  republicanPercentage: number;
  electoralVotes: number;
  margin: number;
}

export interface ProcessedStateData {
  stateCode: string;
  stateName: string;
  winner: Party | null;
  democratVotes: number;
  republicanVotes: number;
  totalVotes: number;
  electoralVotes: number;
  democratPercentage: number;
  republicanPercentage: number;
  margin: number; // demPct - repPct (positive = Dem lead, negative = Rep lead)
  marginVotes: number;
  democratCandidateName?: string;
  republicanCandidateName?: string;
  history?: StateHistoryPoint[];
}

export interface HoveredState {
  data: ProcessedStateData;
  x: number;
  y: number;
}

export enum FrenchedStateName {
  AL = "Alabama", AK = "Alaska", AZ = "Arizona", AR = "Arkansas", CA = "Californie",
  CO = "Colorado", CT = "Connecticut", DE = "Delaware", FL = "Floride", GA = "Géorgie",
  HI = "Hawaï", ID = "Idaho", IL = "Illinois", IN = "Indiana", IA = "Iowa",
  KS = "Kansas", KY = "Kentucky", LA = "Louisiane", ME = "Maine", MD = "Maryland",
  MA = "Massachusetts", MI = "Michigan", MN = "Minnesota", MS = "Mississippi", MO = "Missouri",
  MT = "Montana", NE = "Nebraska", NV = "Nevada", NH = "New Hampshire", NJ = "New Jersey",
  NM = "Nouveau-Mexique", NY = "New York", NC = "Caroline du Nord", ND = "Dakota du Nord", OH = "Ohio",
  OK = "Oklahoma", OR = "Oregon", PA = "Pennsylvanie", RI = "Rhode Island", SC = "Caroline du Sud",
  SD = "Dakota du Sud", TN = "Tennessee", TX = "Texas", UT = "Utah", VT = "Vermont",
  VA = "Virginie", WA = "Washington", WV = "Virginie-Occidentale", WI = "Wisconsin", WY = "Wyoming",
  DC = "District de Columbia"
}
