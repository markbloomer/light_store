export type FixtureKind =
  | 'panel'
  | 'highbay'
  | 'downlight'
  | 'pendant'
  | 'chandelier'
  | 'sconce'
  | 'linear'
  | 'wallpack'
  | 'track'
  | 'bulb';

export type CategoryId =
  | 'panels'
  | 'high-bays'
  | 'downlights'
  | 'pendants'
  | 'chandeliers'
  | 'wall'
  | 'linear'
  | 'outdoor'
  | 'track'
  | 'lamps';

export type Application = 'Residential' | 'Commercial' | 'Industrial';

export type Certification = 'DLC' | 'DLC Premium' | 'cULus' | 'cETL' | 'ENERGY STAR' | 'IP65';

export type ProductTag = 'new' | 'bestseller' | 'sale' | 'rebate';

export type Province = 'ON' | 'QC' | 'AB' | 'BC';

export interface Location {
  id: string;
  city: string;
  province: Province;
  kind: 'Distribution Centre' | 'Branch' | 'Showroom';
}

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  fixture: FixtureKind;
  application: Application;
}

export interface IncomingPO {
  qty: number;
  eta: string;
  locationId: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: CategoryId;
  fixture: FixtureKind;
  application: Application;
  price: number;
  compareAt?: number;
  cost: number;
  watts: number;
  lumens: number;
  cctOptions: number[];
  cri: number;
  dimmable: boolean;
  voltage: string;
  certifications: Certification[];
  lifespanHrs: number;
  warrantyYrs: number;
  finishes: string[];
  rating: number;
  reviews: number;
  tags: ProductTag[];
  description: string;
  /** glTF path. Listings without one keep the drawn fixture art. */
  model?: string;
  addedDaysAgo: number;
  stock: Record<string, number>;
  incoming?: IncomingPO;
}
