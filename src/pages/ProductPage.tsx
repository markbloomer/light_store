import { BadgeCheck, Download, Lightbulb, LightbulbOff, Minus, Plus, ShieldCheck, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { FixtureArt } from '../components/product/FixtureArt';
import { StockByLocation } from '../components/product/StockByLocation';
import { TagBadges } from '../components/product/TagBadges';
import { Button, ButtonLink } from '../components/ui/Button';
import { StockDot } from '../components/ui/StockDot';
import { useCart } from '../context/CartContext';
import { useVendor } from '../context/VendorContext';
import { CATEGORY_BY_ID } from '../data/categories';
import { PRODUCT_BY_ID, PRODUCTS } from '../data/products';
import { cctLabel, cctToCss } from '../lib/color';
import { efficacy, money, num, pct } from '../lib/format';
import { margin, scopeLabel, stockIn, stockLevel, totalStock } from '../lib/inventory';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { id = '' } = useParams();
  const p = PRODUCT_BY_ID[id];
  const { enabled: vendor, scope } = useVendor();
  const { add } = useCart();

  const [cct, setCct] = useState(p?.cctOptions[0] ?? 3000);
  const [finish, setFinish] = useState(p?.finishes[0] ?? '');
  const [qty, setQty] = useState(1);
  const [lit, setLit] = useState(true);

  useEffect(() => {
    if (!p) return;
    setCct(p.cctOptions[0]);
    setFinish(p.finishes[0]);
    setQty(1);
    window.scrollTo({ top: 0 });
  }, [p]);

  if (!p) {
    return (
      <div className={`container ${styles.missing}`}>
        <h1>Product not found</h1>
        <ButtonLink to="/shop" variant="primary">
          Back to shop
        </ButtonLink>
      </div>
    );
  }

  const cat = CATEGORY_BY_ID[p.category];
  const scopedQty = stockIn(p, scope);
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.category === p.category || x.application === p.application)).slice(0, 4);

  const specs: [string, string][] = [
    ['Wattage', `${p.watts} W`],
    ['Lumens', `${num(p.lumens)} lm`],
    ['Efficacy', `${efficacy(p.lumens, p.watts)} lm/W`],
    ['Colour temperature', p.cctOptions.map((k) => `${num(k)}K`).join(' / ')],
    ['CRI', `${p.cri}+`],
    ['Input voltage', p.voltage],
    ['Dimming', p.dimmable ? (p.application === 'Residential' ? 'Phase (TRIAC/ELV)' : '0–10V') : 'Non-dimmable'],
    ['Rated life', `${num(p.lifespanHrs)} hrs (L70)`],
    ['Certifications', p.certifications.join(', ')],
    ['Warranty', `${p.warrantyYrs} years`],
  ];

  return (
    <div className="container">
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/shop?app=${p.application}`}>{p.application}</Link>
        <span>/</span>
        <Link to={`/shop?cat=${p.category}`}>{cat.name}</Link>
      </nav>

      <div className={styles.layout}>
        <section
          className={styles.stage}
          data-lit={lit}
          style={{ ['--pl' as string]: cctToCss(cct, 0.55), ['--pl-soft' as string]: cctToCss(cct, 0.16) }}
        >
          <div className={styles.stageGlow} />
          <div className={styles.stageArt}>
            <FixtureArt kind={p.fixture} cct={cct} intensity={lit ? 1.25 : 0} />
          </div>
          <div className={styles.stageBadges}>
            <TagBadges tags={p.tags} max={3} />
          </div>
          <button type="button" className={styles.lightSwitch} onClick={() => setLit(!lit)} aria-pressed={lit}>
            {lit ? <Lightbulb size={15} /> : <LightbulbOff size={15} />}
            {lit ? 'Lights on' : 'Lights off'}
          </button>
          <div className={styles.stageMeta}>
            <span className="mono">{num(cct)}K</span>
            <span>{cctLabel(cct)}</span>
          </div>
        </section>

        <section className={styles.info}>
          <div className={styles.topline}>
            <span className="eyebrow">{p.brand}</span>
            <span className={`mono ${styles.sku}`}>SKU {p.sku}</span>
          </div>
          <h1 className={styles.name}>{p.name}</h1>
          <div className={styles.rating}>
            <span className={styles.stars} style={{ ['--r' as string]: p.rating / 5 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </span>
            <span>
              {p.rating} · {p.reviews} reviews
            </span>
          </div>

          {vendor ? (
            <dl className={styles.vendorPrice}>
              <div>
                <dt>Unit cost</dt>
                <dd className="mono">{money(p.cost)}</dd>
              </div>
              <div>
                <dt>MSRP</dt>
                <dd className="mono">{money(p.price)}</dd>
              </div>
              <div>
                <dt>Margin</dt>
                <dd className="mono" data-good={margin(p) >= 0.35}>
                  {pct(margin(p))} <small>({money(p.price - p.cost)})</small>
                </dd>
              </div>
              <div>
                <dt>On hand · {scopeLabel(scope)}</dt>
                <dd className="mono">
                  {num(scopedQty)} <small>/ {num(totalStock(p))} total</small>
                </dd>
              </div>
            </dl>
          ) : (
            <div className={styles.price}>
              <span className={styles.now}>{money(p.price)}</span>
              {p.compareAt && (
                <>
                  <span className={styles.was}>{money(p.compareAt)}</span>
                  <span className={styles.save}>Save {money(p.compareAt - p.price)}</span>
                </>
              )}
            </div>
          )}

          <p className={styles.desc}>{p.description}</p>

          <div className={styles.option}>
            <div className={styles.optionHead}>
              <span>Colour temperature</span>
              <strong>
                {num(cct)}K · {cctLabel(cct)}
              </strong>
            </div>
            <div className={styles.cctRow} role="radiogroup" aria-label="Colour temperature">
              {p.cctOptions.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={k === cct}
                  className={styles.cct}
                  onClick={() => setCct(k)}
                  style={{ ['--c' as string]: cctToCss(k) }}
                >
                  <span className={styles.cctDot} />
                  <span className="mono">{num(k)}K</span>
                </button>
              ))}
            </div>
          </div>

          {p.finishes.length > 1 && (
            <div className={styles.option}>
              <div className={styles.optionHead}>
                <span>Finish</span>
                <strong>{finish}</strong>
              </div>
              <div className={styles.finishRow} role="radiogroup" aria-label="Finish">
                {p.finishes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={f === finish}
                    className={styles.finish}
                    onClick={() => setFinish(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.buy}>
            <div className={styles.qty}>
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                <Minus size={15} />
              </button>
              <span className="mono">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">
                <Plus size={15} />
              </button>
            </div>
            <Button variant="primary" size="lg" className={styles.addBtn} onClick={() => add(p, { cct, finish, qty })}>
              {vendor ? 'Add to order' : 'Add to cart'} · {money(p.price * qty)}
            </Button>
          </div>

          {!vendor && (
            <div className={styles.avail}>
              <StockDot level={stockLevel(totalStock(p), p)}>
                {totalStock(p) > 0 ? 'In stock — ships in 1–2 business days' : 'Backordered'}
              </StockDot>
            </div>
          )}

          <ul className={styles.perks}>
            <li>
              <Zap size={15} /> {efficacy(p.lumens, p.watts)} lm/W efficacy
            </li>
            <li>
              <ShieldCheck size={15} /> {p.warrantyYrs}-year warranty
            </li>
            {p.certifications.some((c) => c.startsWith('DLC')) && (
              <li>
                <BadgeCheck size={15} /> Utility rebate eligible
              </li>
            )}
            <li>
              <Download size={15} /> Spec sheet & IES file
            </li>
          </ul>
        </section>
      </div>

      <div className={styles.lower}>
        <section>
          <h2 className={styles.h2}>Specifications</h2>
          <dl className={styles.specs}>
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2 className={styles.h2}>{vendor ? 'Inventory by location' : 'Pickup availability'}</h2>
          <StockByLocation product={p} detailed={vendor} scope={scope} />
        </section>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className={`${styles.h2} ${styles.relatedTitle}`}>You may also like</h2>
          <div className={styles.related}>
            {related.map((r, i) => (
              <ProductCard key={r.id} product={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
