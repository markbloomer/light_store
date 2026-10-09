import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useVendor } from '../../context/VendorContext';
import { CATEGORY_BY_ID } from '../../data/categories';
import { LOCATION_BY_ID } from '../../data/locations';
import type { Product } from '../../data/types';
import { money, num, pct } from '../../lib/format';
import { margin, scopeLocationIds, stockIn, stockLevel } from '../../lib/inventory';
import { FixtureArt } from '../product/FixtureArt';
import { StockDot } from '../ui/StockDot';
import styles from './VendorTable.module.css';

export function VendorTable({ products }: { products: Product[] }) {
  const { scope } = useVendor();
  const { add } = useCart();
  const ids = scopeLocationIds(scope);
  const showBranches = ids.length > 1 && ids.length <= 9;

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th className={styles.r}>Cost</th>
            <th className={styles.r}>MSRP</th>
            <th className={styles.r}>Margin</th>
            <th className={styles.r}>On hand</th>
            {showBranches &&
              ids.map((id) => (
                <th key={id} className={`${styles.r} ${styles.branch}`} title={LOCATION_BY_ID[id].city}>
                  {LOCATION_BY_ID[id].city.slice(0, 3).toUpperCase()}
                </th>
              ))}
            <th>Inbound</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const q = stockIn(p, scope);
            const m = margin(p);
            return (
              <tr key={p.id}>
                <td>
                  <Link to={`/product/${p.id}`} className={styles.prod}>
                    <span className={styles.thumb}>
                      <FixtureArt kind={p.fixture} cct={p.cctOptions[0]} />
                    </span>
                    <span>
                      <span className={styles.name}>{p.name}</span>
                      <span className={styles.cat}>
                        {p.brand} · {CATEGORY_BY_ID[p.category].name}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="mono">{p.sku}</td>
                <td className={`mono ${styles.r}`}>{money(p.cost)}</td>
                <td className={`mono ${styles.r}`}>{money(p.price)}</td>
                <td className={`mono ${styles.r}`} data-good={m >= 0.35}>
                  {pct(m)}
                </td>
                <td className={styles.r}>
                  <StockDot level={stockLevel(q, p)}>
                    <span className="mono">{num(q)}</span>
                  </StockDot>
                </td>
                {showBranches &&
                  ids.map((id) => (
                    <td key={id} className={`mono ${styles.r} ${styles.branch}`} data-zero={!p.stock[id]}>
                      {p.stock[id] ?? 0}
                    </td>
                  ))}
                <td className={styles.inbound}>
                  {p.incoming ? (
                    <>
                      <span className="mono">+{num(p.incoming.qty)}</span> {p.incoming.eta}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.add}
                    onClick={() => add(p, { cct: p.cctOptions[0], finish: p.finishes[0] })}
                    aria-label={`Add ${p.name} to order`}
                  >
                    <Plus size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
