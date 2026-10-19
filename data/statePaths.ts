import { US_STATE_GEO } from './usStateGeo';

export const STATE_PATHS: { [key: string]: string } = Object.fromEntries(
  Object.entries(US_STATE_GEO).map(([code, info]) => [code, info.path])
);
