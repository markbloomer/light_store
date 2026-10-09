import { CATEGORY_BY_ID } from '../data/categories';
import type { Product } from '../data/types';

function haystack(p: Product) {
  return [p.name, p.sku, p.brand, CATEGORY_BY_ID[p.category].name, p.application, ...p.certifications, `${p.watts}w`]
    .join(' ')
    .toLowerCase();
}

/** Every whitespace-separated term must appear somewhere; name hits rank first. */
export function searchProducts(products: Product[], query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return products;
  return products
    .filter((p) => {
      const h = haystack(p);
      return terms.every((t) => h.includes(t));
    })
    .sort((a, b) => {
      const an = terms.some((t) => a.name.toLowerCase().includes(t)) ? 0 : 1;
      const bn = terms.some((t) => b.name.toLowerCase().includes(t)) ? 0 : 1;
      return an - bn;
    });
}
