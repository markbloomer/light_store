import type { Category, CategoryId } from './types';

export const CATEGORIES: Category[] = [
  { id: 'pendants', name: 'Pendants', blurb: 'Statement light over islands & tables', fixture: 'pendant', application: 'Residential' },
  { id: 'chandeliers', name: 'Chandeliers', blurb: 'Sculptural centrepieces', fixture: 'chandelier', application: 'Residential' },
  { id: 'wall', name: 'Wall Sconces', blurb: 'Layered ambient light', fixture: 'sconce', application: 'Residential' },
  { id: 'downlights', name: 'Pot Lights', blurb: 'Slim recessed, 5-CCT selectable', fixture: 'downlight', application: 'Residential' },
  { id: 'panels', name: 'Panels & Troffers', blurb: 'Flat, glare-free office light', fixture: 'panel', application: 'Commercial' },
  { id: 'linear', name: 'Linear & Strip', blurb: 'Continuous runs & coves', fixture: 'linear', application: 'Commercial' },
  { id: 'track', name: 'Track', blurb: 'Retail & gallery accenting', fixture: 'track', application: 'Commercial' },
  { id: 'high-bays', name: 'High Bays', blurb: 'Warehouses up to 45 ft', fixture: 'highbay', application: 'Industrial' },
  { id: 'outdoor', name: 'Outdoor & Area', blurb: 'Wall packs, flood & site', fixture: 'wallpack', application: 'Industrial' },
  { id: 'lamps', name: 'Lamps & Bulbs', blurb: 'Filament, A19, PAR & tubes', fixture: 'bulb', application: 'Residential' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;
