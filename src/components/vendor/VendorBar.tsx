import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { useVendor } from '../../context/VendorContext';
import { LOCATIONS, PROVINCES } from '../../data/locations';
import { PRODUCTS } from '../../data/products';
import type { Province } from '../../data/types';
import { money, num, pct } from '../../lib/format';
import { margin, parseScope, scopeKey, stockIn, stockLevel } from '../../lib/inventory';
import styles from './VendorBar.module.css';

export function VendorBar() {
  const { enabled, scope, setScope } = useVendor();

  const kpis = useMemo(() => {
    let units = 0;
    let value = 0;
    let low = 0;
    let out = 0;
    for (const p of PRODUCTS) {
      const q = stockIn(p, scope);
      units += q;
      value += q * p.cost;
      const lvl = stockLevel(q, p);
      if (lvl === 'low') low++;
      if (lvl === 'out') out++;
    }
    const avgMargin = PRODUCTS.reduce((s, p) => s + margin(p), 0) / PRODUCTS.length;
    return { units, value, low, out, avgMargin };
  }, [scope]);

  if (!enabled) return null;

  return (
    <div className={styles.bar} role="region" aria-label="Vendor tools">
      <div className={`container ${styles.row}`}>
        <span className={styles.badge}>
          <span className={styles.pulse} aria-hidden="true" />
          Vendor view
        </span>

        <label className={styles.scope}>
          <MapPin size={14} />
          <span className="visually-hidden">Inventory location</span>
          <select value={scopeKey(scope)} onChange={(e) => setScope(parseScope(e.target.value))}>
            <option value="all">All locations (Canada)</option>
            {(Object.keys(PROVINCES) as Province[]).map((prov) => (
              <optgroup key={prov} label={PROVINCES[prov]}>
                <option value={`p:${prov}`}>All {PROVINCES[prov]}</option>
                {LOCATIONS.filter((l) => l.province === prov).map((l) => (
                  <option key={l.id} value={`l:${l.id}`}>
                    {l.city}, {prov} — {l.kind}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <dl className={styles.kpis}>
          <Kpi label="Units on hand" value={num(kpis.units)} />
          <Kpi label="Inventory @ cost" value={money(kpis.value)} />
          <Kpi label="Avg. margin" value={pct(kpis.avgMargin)} />
          <Kpi label="Low / out SKUs" value={`${kpis.low} / ${kpis.out}`} tone={kpis.out > 0 ? 'warn' : undefined} />
        </dl>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className={styles.kpi} data-tone={tone}>
      <dt>{label}</dt>
      <dd className="mono">{value}</dd>
    </div>
  );
}
