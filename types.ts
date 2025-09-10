
export enum Party {
  DEMOCRAT = 'Démocrate',
  REPUBLICAN = 'Républicain',
}

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
}

export interface HoveredState {
  data: ProcessedStateData;
  x: number;
  y: number;
}

// A simple enum to map state names to French. In a real app, this would be handled by a proper i18n library.
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
