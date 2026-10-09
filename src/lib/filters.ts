import type { Application, Certification, CategoryId, Product, ProductTag } from '../data/types';
import { efficacy } from './format';
import { stockIn, type Scope } from './inventory';
import { searchProducts } from './search';

export type CctBucket = 'warm' | 'neutral' | 'daylight';
export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'efficacy' | 'stock';

export const CCT_BUCKETS: Record<CctBucket, { label: string; range: [number, number]; sample: number }> = {
  warm: { label: 'Warm · ≤3000K', range: [0, 3000], sample: 2700 },
  neutral: { label: 'Neutral · 3500–4000K', range: [3001, 4300], sample: 4000 },
  daylight: { label: 'Daylight · 5000K+', range: [4301, 99999], sample: 5000 },
};

export const SORTS: Record<SortKey, string> = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  efficacy: 'Efficacy (lm/W)',
  stock: 'Stock on hand',
};

export const CERT_FILTERS: Certification[] = ['DLC Premium', 'DLC', 'ENERGY STAR', 'IP65'];

export type Filters = {
  q: string;
  cats: CategoryId[];
  app: Application | null;
  tag: ProductTag | null;
  brands: string[];
  cct: CctBucket[];
  certs: Certification[];
  maxPrice: number | null;
  inStock: boolean;
  dimmable: boolean;
  sort: SortKey;
};

const list = <T extends string>(v: string | null) => (v ? (v.split(',').filter(Boolean) as T[]) : []);

export function readFilters(sp: URLSearchParams): Filters {
  return {
    q: sp.get('q') ?? '',
    cats: list<CategoryId>(sp.get('cat')),
    app: (sp.get('app') as Application | null) ?? null,
    tag: (sp.get('tag') as ProductTag | null) ?? null,
    brands: list(sp.get('brand')),
    cct: list<CctBucket>(sp.get('cct')),
    certs: list<Certification>(sp.get('cert')),
    maxPrice: sp.get('max') ? Number(sp.get('max')) : null,
    inStock: sp.get('stock') === '1',
    dimmable: sp.get('dim') === '1',
    sort: (sp.get('sort') as SortKey | null) ?? 'featured',
  };
}

export function activeFilterCount(f: Filters) {
  return (
    f.cats.length + f.brands.length + f.cct.length + f.certs.length +
    (f.app ? 1 : 0) + (f.tag ? 1 : 0) + (f.maxPrice ? 1 : 0) + (f.inStock ? 1 : 0) + (f.dimmable ? 1 : 0) + (f.q ? 1 : 0)
  );
}

export function applyFilters(products: Product[], f: Filters, scope: Scope): Product[] {
  let out = f.q ? searchProducts(products, f.q) : products;

  out = out.filter((p) => {
    if (f.cats.length && !f.cats.includes(p.category)) return false;
    if (f.app && p.application !== f.app) return false;
    if (f.tag && !p.tags.includes(f.tag)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.certs.length && !f.certs.some((c) => p.certifications.includes(c))) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.dimmable && !p.dimmable) return false;
    if (f.inStock && stockIn(p, scope) <= 0) return false;
    if (f.cct.length) {
      const hit = f.cct.some((b) => {
        const [lo, hi] = CCT_BUCKETS[b].range;
        return p.cctOptions.some((k) => k >= lo && k <= hi);
      });
      if (!hit) return false;
    }
    return true;
  });

  const sorted = [...out];
  switch (f.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sorted.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
      break;
    case 'efficacy':
      sorted.sort((a, b) => efficacy(b.lumens, b.watts) - efficacy(a.lumens, a.watts));
      break;
    case 'stock':
      sorted.sort((a, b) => stockIn(b, scope) - stockIn(a, scope));
      break;
    default:
      sorted.sort((a, b) => Number(b.tags.includes('bestseller')) - Number(a.tags.includes('bestseller')));
  }
  return sorted;
}
