import { Briefcase, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useVendor } from '../../context/VendorContext';
import { CATEGORIES } from '../../data/categories';
import type { Application } from '../../data/types';
import { FixtureArt } from '../product/FixtureArt';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { Logo } from './Logo';
import styles from './MobileMenu.module.css';

const GROUPS: Application[] = ['Residential', 'Commercial', 'Industrial'];

const QUICK = [
  { to: '/shop?tag=sale', label: 'Sale' },
  { to: '/shop?tag=new', label: 'New arrivals' },
  { to: '/shop?tag=rebate', label: 'Rebates' },
  { to: '/shop', label: 'All products' },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { pathname, search } = useLocation();
  const { theme, toggle } = useTheme();
  const { enabled, setEnabled } = useVendor();

  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (rootRef.current) rootRef.current.inert = !open;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        icon
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu size={20} />
      </Button>

      {createPortal(
        <div ref={rootRef} className={styles.root} data-open={open} aria-hidden={!open}>
          <div className={styles.scrim} onClick={() => setOpen(false)} />
          <nav className={styles.drawer} aria-label="Mobile">
            <header className={styles.head}>
              <Logo />
              <Button variant="ghost" icon size="sm" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} />
              </Button>
            </header>

            <div className={styles.body}>
              <div className={styles.quick}>
                {QUICK.map((q) => (
                  <Link key={q.to} to={q.to} className={styles.chip}>
                    {q.label}
                  </Link>
                ))}
              </div>

              {GROUPS.map((g) => (
                <section key={g} className={styles.group}>
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
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <footer className={styles.foot}>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                className={styles.vendor}
                onClick={() => setEnabled(!enabled)}
              >
                <Briefcase size={16} />
                <span>
                  <strong>Vendor view</strong>
                  <small>Cost & stock by location</small>
                </span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.knob} />
                </span>
              </button>
              <Segmented
                label="Theme"
                value={theme}
                onChange={(t) => t !== theme && toggle()}
                options={[
                  { value: 'dark', label: <><Moon size={14} /> Dark</> },
                  { value: 'light', label: <><Sun size={14} /> Light</> },
                ]}
              />
            </footer>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
