import { Check, ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { CATEGORIES } from '../../data/categories';
import { BRANDS, PRODUCTS } from '../../data/products';
import type { Application } from '../../data/types';
import { cctToCss } from '../../lib/color';
import { CCT_BUCKETS, CERT_FILTERS, type CctBucket, type Filters } from '../../lib/filters';
import { money } from '../../lib/format';
import styles from './FilterPanel.module.css';

type Props = {
  filters: Filters;
  set: (key: string, value: string | null) => void;
  toggleIn: (key: string, value: string, current: string[]) => void;
  vendor: boolean;
};

const APPS: Application[] = ['Residential', 'Commercial', 'Industrial'];
const PRICE_CEIL = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 100) * 100;

export function FilterPanel({ filters: f, set, toggleIn, vendor }: Props) {
  return (
    <aside className={styles.panel} aria-label="Filters">
      <Group title="Application">
        <div className={styles.chips}>
          {APPS.map((a) => (
            <button
              key={a}
              type="button"
              className={styles.chip}
              aria-pressed={f.app === a}
              onClick={() => set('app', f.app === a ? null : a)}
            >
              {a}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Category">
        {CATEGORIES.filter((c) => !f.app || c.application === f.app).map((c) => (
          <CheckRow
            key={c.id}
            checked={f.cats.includes(c.id)}
            onChange={() => toggleIn('cat', c.id, f.cats)}
            label={c.name}
            count={PRODUCTS.filter((p) => p.category === c.id).length}
          />
        ))}
      </Group>

      <Group title="Colour temperature">
        {(Object.keys(CCT_BUCKETS) as CctBucket[]).map((b) => (
          <CheckRow
            key={b}
            checked={f.cct.includes(b)}
            onChange={() => toggleIn('cct', b, f.cct)}
            label={
              <span className={styles.cct}>
                <span style={{ background: cctToCss(CCT_BUCKETS[b].sample) }} />
                {CCT_BUCKETS[b].label}
              </span>
            }
          />
        ))}
      </Group>

      <Group title="Max price">
        <div className={styles.price}>
          <input
            type="range"
            min={10}
            max={PRICE_CEIL}
            step={10}
            value={f.maxPrice ?? PRICE_CEIL}
            onChange={(e) => {
              const v = Number(e.target.value);
              set('max', v >= PRICE_CEIL ? null : String(v));
            }}
            style={{ ['--fill' as string]: `${(((f.maxPrice ?? PRICE_CEIL) - 10) / (PRICE_CEIL - 10)) * 100}%` }}
            aria-label="Maximum price"
          />
          <div className={styles.priceVals}>
            <span>{money(10)}</span>
            <strong>{f.maxPrice ? money(f.maxPrice) : 'Any'}</strong>
          </div>
        </div>
      </Group>

      <Group title="Certifications">
        {CERT_FILTERS.map((c) => (
          <CheckRow key={c} checked={f.certs.includes(c)} onChange={() => toggleIn('cert', c, f.certs)} label={c} />
        ))}
      </Group>

      <Group title="Brand" defaultOpen={false}>
        {BRANDS.map((b) => (
          <CheckRow key={b} checked={f.brands.includes(b)} onChange={() => toggleIn('brand', b, f.brands)} label={b} />
        ))}
      </Group>

      <Group title="Availability">
        <CheckRow
          checked={f.inStock}
          onChange={() => set('stock', f.inStock ? null : '1')}
          label={vendor ? 'In stock at selected location' : 'In stock'}
        />
        <CheckRow checked={f.dimmable} onChange={() => set('dim', f.dimmable ? null : '1')} label="Dimmable" />
      </Group>
    </aside>
  );
}

function Group({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={styles.group} data-open={open}>
      <button type="button" className={styles.groupHead} onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}
        <ChevronDown size={15} />
      </button>
      <div className={styles.groupBody}>
        <div>{children}</div>
      </div>
    </section>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  count?: number;
}) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={onChange} className="visually-hidden" />
      <span className={styles.box} aria-hidden="true">
        <Check size={12} strokeWidth={3} />
      </span>
      <span className={styles.checkLabel}>{label}</span>
      {count != null && <span className={styles.count}>{count}</span>}
    </label>
  );
}
