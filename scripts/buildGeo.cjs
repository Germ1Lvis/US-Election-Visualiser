const fs = require('fs');
const topojson = require('topojson-client');
const d3Geo = require('d3-geo');
const atlas = require('us-atlas/states-albers-10m.json');

const pathGen = d3Geo.geoPath();
const statesGeo = topojson.feature(atlas, atlas.objects.states);
const nationGeo = topojson.feature(atlas, atlas.objects.nation);

const hexGrid = {
  AK: { col: 0, row: 0 },
  ME: { col: 11, row: 0 },
  VT: { col: 9, row: 0 },
  NH: { col: 10, row: 0 },

  WA: { col: 1, row: 1 },
  ID: { col: 2, row: 1 },
  MT: { col: 3, row: 1 },
  ND: { col: 4, row: 1 },
  MN: { col: 5, row: 1 },
  WI: { col: 6, row: 1 },
  MI: { col: 7, row: 1 },
  NY: { col: 8, row: 1 },
  MA: { col: 9, row: 1 },
  CT: { col: 10, row: 1 },

  OR: { col: 1, row: 2 },
  NV: { col: 2, row: 2 },
  WY: { col: 3, row: 2 },
  SD: { col: 4, row: 2 },
  IA: { col: 5, row: 2 },
  IL: { col: 6, row: 2 },
  IN: { col: 7, row: 2 },
  OH: { col: 8, row: 2 },
  PA: { col: 9, row: 2 },
  NJ: { col: 10, row: 2 },
  RI: { col: 11, row: 2 },

  CA: { col: 1, row: 3 },
  UT: { col: 2, row: 3 },
  CO: { col: 3, row: 3 },
  NE: { col: 4, row: 3 },
  MO: { col: 5, row: 3 },
  KY: { col: 6, row: 3 },
  WV: { col: 7, row: 3 },
  VA: { col: 8, row: 3 },
  MD: { col: 9, row: 3 },
  DE: { col: 10, row: 3 },

  AZ: { col: 2, row: 4 },
  NM: { col: 3, row: 4 },
  KS: { col: 4, row: 4 },
  AR: { col: 5, row: 4 },
  TN: { col: 6, row: 4 },
  NC: { col: 7, row: 4 },
  SC: { col: 8, row: 4 },
  DC: { col: 9, row: 4 },

  OK: { col: 4, row: 5 },
  LA: { col: 5, row: 5 },
  MS: { col: 6, row: 5 },
  AL: { col: 7, row: 5 },
  GA: { col: 8, row: 5 },

  TX: { col: 4, row: 6 },
  FL: { col: 8, row: 6 },

  HI: { col: 0, row: 7 }
};

const fipsMap = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY'
};

const frenchNames = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'Californie',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Floride', GA: 'Géorgie',
  HI: 'Hawaï', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiane', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'Nouveau-Mexique', NY: 'New York', NC: 'Caroline du Nord', ND: 'Dakota du Nord', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvanie', RI: 'Rhode Island', SC: 'Caroline du Sud',
  SD: 'Dakota du Sud', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginie', WA: 'Washington', WV: 'Virginie-Occidentale', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District de Columbia'
};

const callouts = {
  VT: { lineStart: [873, 136], target: [930, 90] },
  NH: { lineStart: [893, 140], target: [930, 125] },
  MA: { lineStart: [897, 173], target: [930, 160] },
  RI: { lineStart: [905, 184], target: [930, 195] },
  CT: { lineStart: [886, 190], target: [930, 230] },
  NJ: { lineStart: [862, 230], target: [930, 265] },
  DE: { lineStart: [853, 260], target: [930, 300] },
  MD: { lineStart: [832, 264], target: [930, 335] },
  DC: { lineStart: [828, 267], target: [930, 370] }
};

// Clean number formatting without regex bugs
function roundPath(d) {
  // Round to 1 decimal place safely
  return d.replace(/(\d+\.\d{1})\d*/g, (match, p1) => p1);
}

const states = {};
for (const f of statesGeo.features) {
  const code = fipsMap[f.id];
  if (!code) continue;
  const rawPath = pathGen(f);
  const centroid = pathGen.centroid(f).map(n => Math.round(n * 10) / 10);
  states[code] = {
    code,
    name: frenchNames[code] || f.properties.name,
    path: roundPath(rawPath),
    centroid,
    callout: callouts[code] || undefined,
    hex: hexGrid[code]
  };
}

const nationPath = roundPath(pathGen(nationGeo));

const content = `// Official Albers USA High-Precision Projection (960x600)
// US Census Bureau / TopoJSON Albers 10m official geography

export interface StateGeoInfo {
  code: string;
  name: string;
  path: string;
  centroid: [number, number];
  callout?: {
    lineStart: [number, number];
    target: [number, number];
  };
  hex: {
    col: number;
    row: number;
  };
}

export const NATION_PATH: string = ${JSON.stringify(nationPath)};

export const US_STATE_GEO: Record<string, StateGeoInfo> = ${JSON.stringify(states, null, 2)};
`;

fs.writeFileSync('data/usStateGeo.ts', content);
console.log('Successfully generated data/usStateGeo.ts');
console.log('WA path sample:', states['WA'].path.slice(0, 100));
console.log('CA path sample:', states['CA'].path.slice(0, 100));
console.log('Nation path sample:', nationPath.slice(0, 100));
