import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import type { Application } from '../../data/types';
import { FixtureArt } from '../product/FixtureArt';
import styles from './MegaMenu.module.css';

const GROUPS: Application[] = ['Residential', 'Commercial', 'Industrial'];

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<number>();
  const { pathname, search } = useLocation();

  useEffect(() => setOpen(false), [pathname, search]);

  const show = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className={styles.root} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        Shop <ChevronDown size={14} className={styles.chev} />
      </button>

      <div className={styles.panel} data-open={open} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
        <div className={styles.grid}>
          {GROUPS.map((g) => (
            <div key={g} className={styles.group}>
              <Link to={`/shop?app=${g}`} className="eyebrow">
                {g}
              </Link>
              <ul>
                {CATEGORIES.filter((c) => c.application === g).map((c) => (
                  <li key={c.id}>
                    <Link to={`/shop?cat=${c.id}`} className={styles.item}>
                      <span className={styles.thumb}>
                        <FixtureArt kind={c.fixture} cct={g === 'Residential' ? 2700 : 4000} />
                      </span>
                      <span>
                        <span className={styles.name}>{c.name}</span>
                        <span className={styles.blurb}>{c.blurb}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link to="/shop?tag=sale" className={styles.promo}>
            <span className="eyebrow">Fall event</span>
            <strong>Up to 25% off</strong>
            <span>Panels, high bays & pot lights. Stacks with utility rebates.</span>
            <span className={styles.promoCta}>Shop the sale →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
