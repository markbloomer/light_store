import { LayoutGrid, Rows3, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FilterPanel } from '../components/catalog/FilterPanel';
import { ProductCard } from '../components/product/ProductCard';
import { FixtureArt } from '../components/product/FixtureArt';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { VendorTable } from '../components/vendor/VendorTable';
import { useVendor } from '../context/VendorContext';
import { CATEGORY_BY_ID } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { activeFilterCount, applyFilters, CCT_BUCKETS, readFilters, SORTS, type SortKey } from '../lib/filters';
import { money } from '../lib/format';
import { scopeLabel } from '../lib/inventory';
import styles from './ShopPage.module.css';

type View = 'grid' | 'table';

const TAG_TITLES = { sale: 'On sale', new: 'New arrivals', bestseller: 'Bestsellers', rebate: 'Rebate-eligible lighting' };

export function ShopPage() {
  const [sp, setSp] = useSearchParams();
  const { enabled: vendor, scope } = useVendor();
  const [view, setView] = useState<View>('grid');
  const [drawer, setDrawer] = useState(false);

  const filters = useMemo(() => readFilters(sp), [sp]);
  const results = useMemo(() => applyFilters(PRODUCTS, filters, scope), [filters, scope]);

  useEffect(() => {
    if (!vendor) setView('grid');
  }, [vendor]);

  const set = useCallback(
    (key: string, value: string | null) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value == null || value === '') next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setSp],
  );

  const toggleIn = useCallback(
    (key: string, value: string, current: string[]) => {
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      set(key, next.length ? next.join(',') : null);
    },
    [set],
  );

  const title =
    filters.q
      ? `Results for “${filters.q}”`
      : filters.cats.length === 1
        ? CATEGORY_BY_ID[filters.cats[0]].name
        : filters.tag
          ? TAG_TITLES[filters.tag]
          : filters.app
            ? `${filters.app} lighting`
            : 'All lighting';

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: () => set('q', null) }] : []),
    ...(filters.app ? [{ label: filters.app, clear: () => set('app', null) }] : []),
    ...(filters.tag ? [{ label: TAG_TITLES[filters.tag], clear: () => set('tag', null) }] : []),
    ...filters.cats.map((c) => ({ label: CATEGORY_BY_ID[c]?.name ?? c, clear: () => toggleIn('cat', c, filters.cats) })),
    ...filters.cct.map((c) => ({ label: CCT_BUCKETS[c].label.split(' ·')[0], clear: () => toggleIn('cct', c, filters.cct) })),
    ...filters.certs.map((c) => ({ label: c, clear: () => toggleIn('cert', c, filters.certs) })),
    ...filters.brands.map((b) => ({ label: b, clear: () => toggleIn('brand', b, filters.brands) })),
    ...(filters.maxPrice ? [{ label: `Under ${money(filters.maxPrice)}`, clear: () => set('max', null) }] : []),
    ...(filters.inStock ? [{ label: 'In stock', clear: () => set('stock', null) }] : []),
    ...(filters.dimmable ? [{ label: 'Dimmable', clear: () => set('dim', null) }] : []),
  ];

  return (
    <div className="container">
      <header className={styles.head}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          {title !== 'All lighting' && (
            <>
              <span>/</span>
              <span aria-current="page">{title}</span>
            </>
          )}
        </nav>
        <div className={styles.titleRow}>
          <h1>{title}</h1>
          <span className={`mono ${styles.count}`}>
            {results.length} {results.length === 1 ? 'product' : 'products'}
            {vendor && ` · stock: ${scopeLabel(scope)}`}
          </span>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Button size="sm" className={styles.filterBtn} onClick={() => setDrawer(true)}>
          <SlidersHorizontal size={14} /> Filters
          {activeFilterCount(filters) > 0 && <span className={styles.fcount}>{activeFilterCount(filters)}</span>}
        </Button>

        <div className={styles.chips}>
          {chips.map((c) => (
            <button key={c.label} type="button" className={styles.chip} onClick={c.clear}>
              {c.label} <X size={12} />
            </button>
          ))}
          {chips.length > 1 && (
            <button type="button" className={styles.clear} onClick={() => setSp({}, { replace: true })}>
              Clear all
            </button>
          )}
        </div>

        <div className={styles.tools}>
          <label className={styles.sort}>
            <span>Sort</span>
            <select value={filters.sort} onChange={(e) => set('sort', e.target.value === 'featured' ? null : e.target.value)}>
              {(Object.keys(SORTS) as SortKey[])
                .filter((k) => vendor || k !== 'stock')
                .map((k) => (
                  <option key={k} value={k}>
                    {SORTS[k]}
                  </option>
                ))}
            </select>
          </label>
          {vendor && (
            <Segmented<View>
              label="Layout"
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: 'grid', label: <LayoutGrid size={14} />, title: 'Grid' },
                { value: 'table', label: <Rows3 size={14} />, title: 'Table' },
              ]}
            />
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.aside} data-open={drawer}>
          <div className={styles.asideHead}>
            <strong>Filters</strong>
            <Button variant="ghost" icon size="sm" onClick={() => setDrawer(false)} aria-label="Close filters">
              <X size={16} />
            </Button>
          </div>
          <FilterPanel filters={filters} set={set} toggleIn={toggleIn} vendor={vendor} />
        </div>
        {drawer && <div className={styles.scrim} onClick={() => setDrawer(false)} />}

        <main>
          {results.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyArt}>
                <FixtureArt kind="downlight" cct={4000} intensity={0.4} />
              </div>
              <h2>Nothing matches those filters</h2>
              <p>Try removing a filter or broadening your search.</p>
              <Button variant="primary" onClick={() => setSp({}, { replace: true })}>
                Reset filters
              </Button>
            </div>
          ) : view === 'table' ? (
            <VendorTable products={results} />
          ) : (
            <div className={styles.grid}>
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
