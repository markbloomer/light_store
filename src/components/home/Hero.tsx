import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cctLabel, cctToCss } from '../../lib/color';
import { num } from '../../lib/format';
import { FixtureArt } from '../product/FixtureArt';
import { ButtonLink } from '../ui/Button';
import styles from './Hero.module.css';

const MIN_K = 2200;
const MAX_K = 6500;

export function Hero() {
  const [k, setK] = useState(2700);
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const fill = ((k - MIN_K) / (MAX_K - MIN_K)) * 100;

  return (
    <section
      ref={ref}
      className={styles.hero}
      style={{ ['--hero-light' as string]: cctToCss(k, 0.5), ['--hero-light-soft' as string]: cctToCss(k, 0.14) }}
    >
      <div className={styles.grid} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className={`eyebrow ${styles.kicker}`}>
            <span className={styles.dot} /> Canada's lighting specialists since 1998
          </span>
          <h1 className={styles.title}>
            Light, <em>engineered</em>
            <br />
            for every space.
          </h1>
          <p className={styles.lede}>
            Designer pendants to 33,000-lumen high bays. Spec-grade LED, rebate-ready, and stocked across nine
            Canadian branches for same-day pickup.
          </p>
          <div className={styles.ctas}>
            <ButtonLink to="/shop?app=Residential" variant="primary" size="lg">
              Shop residential <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/shop?app=Commercial" size="lg">
              Commercial & industrial
            </ButtonLink>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>SKUs in stock</dt>
              <dd>12,400+</dd>
            </div>
            <div>
              <dt>Branches</dt>
              <dd>9</dd>
            </div>
            <div>
              <dt>Rebates filed in 2025</dt>
              <dd>$4.1M</dd>
            </div>
          </dl>
        </div>

        <div className={styles.stage}>
          <div className={styles.halo} />
          <div className={styles.fixture}>
            <FixtureArt kind="pendant" cct={k} intensity={1.2} />
          </div>
          <div className={styles.dial}>
            <div className={styles.dialHead}>
              <span className="eyebrow">Colour temperature</span>
              <span className={styles.kelvin}>
                <span className="mono">{num(k)}K</span>
                <small>{cctLabel(k)}</small>
              </span>
            </div>
            <input
              type="range"
              min={MIN_K}
              max={MAX_K}
              step={50}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className={styles.range}
              style={{ ['--fill' as string]: `${fill}%` }}
              aria-label="Colour temperature in Kelvin"
            />
            <div className={styles.ticks}>
              <span>Warm</span>
              <span>Neutral</span>
              <span>Daylight</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
