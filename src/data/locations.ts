import type { Location, Province } from './types';

export const LOCATIONS: Location[] = [
  { id: 'tor', city: 'Toronto', province: 'ON', kind: 'Distribution Centre' },
  { id: 'mis', city: 'Mississauga', province: 'ON', kind: 'Branch' },
  { id: 'ott', city: 'Ottawa', province: 'ON', kind: 'Branch' },
  { id: 'ham', city: 'Hamilton', province: 'ON', kind: 'Branch' },
  { id: 'lon', city: 'London', province: 'ON', kind: 'Showroom' },
  { id: 'kit', city: 'Kitchener', province: 'ON', kind: 'Branch' },
  { id: 'mtl', city: 'Montréal', province: 'QC', kind: 'Distribution Centre' },
  { id: 'cgy', city: 'Calgary', province: 'AB', kind: 'Branch' },
  { id: 'van', city: 'Vancouver', province: 'BC', kind: 'Showroom' },
];

export const PROVINCES: Record<Province, string> = {
  ON: 'Ontario',
  QC: 'Québec',
  AB: 'Alberta',
  BC: 'British Columbia',
};

export const LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l])) as Record<
  string,
  Location
>;
