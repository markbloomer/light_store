import { Plus, Star, Truck } from 'lucide-react';
import { useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useVendor } from '../../context/VendorContext';
import type { Product } from '../../data/types';
import { cctToCss } from '../../lib/color';
import { efficacy, money, num, pct } from '../../lib/format';
import { margin, scopeLabel, scopeLocationIds, stockIn, stockLevel } from '../../lib/inventory';
import { Badge } from '../ui/Badge';
import { StockDot } from '../ui/StockDot';
import { FixtureArt } from './FixtureArt';
import { TagBadges } from './TagBadges';
import styles from './ProductCard.module.css';

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const [cct, setCct] = useState(p.cctOptions[0]);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { enabled: vendor, scope } = useVendor();
  const { add } = useCart();

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const qty = stockIn(p, scope);
  const level = stockLevel(qty, p);

  return (
    <article
      ref={ref}
      className={`${styles.card} reveal`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms`, ['--light' as string]: cctToCss(cct, 0.22) }}
      onPointerMove={onMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className={styles.mediaWrap}>
        <Link to={`/product/${p.id}`} className={styles.media} aria-label={p.name}>
          <div className={styles.art}>
            <FixtureArt kind={p.fixture} cct={cct} intensity={hover ? 1.15 : 0.9} />
          </div>
          <div className={styles.badges}>
            <TagBadges tags={p.tags} />
          </div>
        </Link>

        <div className={styles.swatches} role="radiogroup" aria-label="Colour temperature">
          {p.cctOptions.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={k === cct}
              title={`${num(k)}K`}
              className={styles.swatch}
              style={{ background: cctToCss(k) }}
              onPointerEnter={() => setCct(k)}
              onClick={() => setCct(k)}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.quickAdd}
          aria-label={`Add ${p.name} to cart`}
          onClick={() => add(p, { cct, finish: p.finishes[0] })}
          disabled={vendor && qty === 0}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className="eyebrow">{p.brand}</span>
          {vendor ? (
            <span className={`mono ${styles.sku}`}>{p.sku}</span>
          ) : (
            <span className={styles.rating}>
              <Star size={12} fill="currentColor" /> {p.rating} <span>({p.reviews})</span>
            </span>
          )}
        </div>

        <Link to={`/product/${p.id}`} className={styles.name}>
          {p.name}
        </Link>

        <div className={styles.specs}>
          <span>{p.watts}W</span>
          <span>{num(p.lumens)} lm</span>
          <span>{efficacy(p.lumens, p.watts)} lm/W</span>
          <span>CRI {p.cri}</span>
        </div>

        {vendor ? <VendorBlock product={p} qty={qty} level={level} scopeName={scopeLabel(scope)} ids={scopeLocationIds(scope)} /> : (
          <div className={styles.priceRow}>
            <span className={styles.price}>{money(p.price)}</span>
            {p.compareAt && <span className={styles.compare}>{money(p.compareAt)}</span>}
            {p.certifications.includes('DLC Premium') || p.certifications.includes('DLC') ? (
              <span className={styles.cert}>
                <Badge tone="neutral">DLC</Badge>
              </span>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

function VendorBlock({
  product: p,
  qty,
  level,
  scopeName,
  ids,
}: {
  product: Product;
  qty: number;
  level: ReturnType<typeof stockLevel>;
  scopeName: string;
  ids: string[];
}) {
  const max = Math.max(1, ...ids.map((id) => p.stock[id] ?? 0));
  return (
    <div className={styles.vendor}>
      <dl className={styles.vprices}>
        <div>
          <dt>Cost</dt>
          <dd className="mono">{money(p.cost)}</dd>
        </div>
        <div>
          <dt>MSRP</dt>
          <dd className="mono">{money(p.price)}</dd>
        </div>
        <div>
          <dt>Margin</dt>
          <dd className="mono" data-good={margin(p) >= 0.35}>
            {pct(margin(p))}
          </dd>
        </div>
      </dl>
      <div className={styles.vstock}>
        <StockDot level={level}>
          <strong className="mono">{num(qty)}</strong>&nbsp;in {scopeName}
        </StockDot>
        {ids.length > 1 && (
          <span className={styles.spark} aria-hidden="true">
            {ids.map((id) => (
              <span key={id} style={{ height: `${Math.max(6, ((p.stock[id] ?? 0) / max) * 100)}%` }} data-zero={!p.stock[id]} />
            ))}
          </span>
        )}
      </div>
      {p.incoming && (
        <span className={styles.incoming}>
          <Truck size={12} /> +{num(p.incoming.qty)} arriving {p.incoming.eta}
        </span>
      )}
    </div>
  );
}
