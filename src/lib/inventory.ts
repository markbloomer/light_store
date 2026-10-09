import { LOCATION_BY_ID, LOCATIONS, PROVINCES } from '../data/locations';
import type { Product, Province } from '../data/types';

/** A vendor scope is either everything, a whole province, or one branch. */
export type Scope = { type: 'all' } | { type: 'province'; province: Province } | { type: 'location'; id: string };

export const ALL_SCOPE: Scope = { type: 'all' };

export function scopeLocationIds(scope: Scope): string[] {
  switch (scope.type) {
    case 'all':
      return LOCATIONS.map((l) => l.id);
    case 'province':
      return LOCATIONS.filter((l) => l.province === scope.province).map((l) => l.id);
    case 'location':
      return [scope.id];
  }
}

export function stockIn(product: Product, scope: Scope): number {
  return scopeLocationIds(scope).reduce((sum, id) => sum + (product.stock[id] ?? 0), 0);
}

export const totalStock = (product: Product) => stockIn(product, ALL_SCOPE);

export type StockLevel = 'out' | 'low' | 'ok' | 'high';

export function stockLevel(qty: number, product: Product): StockLevel {
  const lowAt = product.price < 60 ? 40 : product.price < 300 ? 10 : 3;
  if (qty <= 0) return 'out';
  if (qty <= lowAt) return 'low';
  if (qty >= lowAt * 6) return 'high';
  return 'ok';
}

export const margin = (p: Product) => (p.price - p.cost) / p.price;

export function scopeKey(scope: Scope) {
  return scope.type === 'all' ? 'all' : scope.type === 'province' ? `p:${scope.province}` : `l:${scope.id}`;
}

export function scopeLabel(scope: Scope) {
  if (scope.type === 'all') return 'Canada';
  if (scope.type === 'province') return PROVINCES[scope.province];
  return LOCATION_BY_ID[scope.id]?.city ?? scope.id;
}

export function parseScope(key: string): Scope {
  if (key.startsWith('p:')) return { type: 'province', province: key.slice(2) as Province };
  if (key.startsWith('l:')) return { type: 'location', id: key.slice(2) };
  return ALL_SCOPE;
}
