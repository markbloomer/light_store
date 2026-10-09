import { Truck } from 'lucide-react';
import { LOCATION_BY_ID, LOCATIONS, PROVINCES } from '../../data/locations';
import type { Product, Province } from '../../data/types';
import { money, num } from '../../lib/format';
import { scopeLocationIds, stockLevel, type Scope } from '../../lib/inventory';
import { StockDot } from '../ui/StockDot';
import styles from './StockByLocation.module.css';

type Props = { product: Product; detailed: boolean; scope: Scope };

/**
 * Customers see pickup availability per branch; vendors get on-hand units,
 * value at cost, and the inbound PO for the same rows.
 */
export function StockByLocation({ product: p, detailed, scope }: Props) {
  const inScope = new Set(scopeLocationIds(scope));
  const max = Math.max(1, ...LOCATIONS.map((l) => p.stock[l.id] ?? 0));
  const provinces = Object.keys(PROVINCES) as Province[];

  return (
    <div className={styles.root} data-detailed={detailed}>
      <div className={styles.head}>
        <span>Location</span>
        {detailed ? (
          <>
            <span className={styles.num}>On hand</span>
            <span className={styles.num}>Value @ cost</span>
            <span />
          </>
        ) : (
          <span className={styles.num}>Pickup</span>
        )}
      </div>

      {provinces.map((prov) => {
        const locs = LOCATIONS.filter((l) => l.province === prov);
        const subtotal = locs.reduce((s, l) => s + (p.stock[l.id] ?? 0), 0);
        return (
          <section key={prov} className={styles.group}>
            <header className={styles.prov}>
              <span>{PROVINCES[prov]}</span>
              {detailed && <span className="mono">{num(subtotal)} units</span>}
            </header>
            {locs.map((l) => {
              const q = p.stock[l.id] ?? 0;
              const level = stockLevel(q, p);
              return (
                <div key={l.id} className={styles.row} data-dim={detailed && !inScope.has(l.id)}>
                  <span className={styles.city}>
                    {l.city}
                    <small>{l.kind}</small>
                  </span>
                  {detailed ? (
                    <>
                      <span className={`mono ${styles.num}`}>{num(q)}</span>
                      <span className={`mono ${styles.num} ${styles.muted}`}>{money(q * p.cost)}</span>
                      <span className={styles.barCell}>
                        <span className={styles.bar} data-level={level} style={{ width: `${(q / max) * 100}%` }} />
                      </span>
                    </>
                  ) : (
                    <span className={styles.num}>
                      <StockDot level={level} />
                    </span>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      {detailed && p.incoming && (
        <div className={styles.po}>
          <Truck size={14} />
          <span>
            Inbound PO: <strong className="mono">+{num(p.incoming.qty)}</strong> to {LOCATION_BY_ID[p.incoming.locationId].city}{' '}
            · ETA {p.incoming.eta}
          </span>
        </div>
      )}
    </div>
  );
}
