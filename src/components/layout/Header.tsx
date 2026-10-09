import { Moon, ShoppingBag, Sun, Briefcase } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useVendor } from '../../context/VendorContext';
import { Button } from '../ui/Button';
import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { SearchBox } from './SearchBox';
import styles from './Header.module.css';

/** Active only when every query param in `to` matches the current URL. */
function QueryLink({ to, children }: { to: string; children: ReactNode }) {
  const { pathname, search } = useLocation();
  const target = new URL(to, window.location.origin);
  const current = new URLSearchParams(search);
  const active =
    pathname === target.pathname && [...target.searchParams].every(([k, v]) => current.get(k) === v);
  return (
    <Link to={to} className={styles.link} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}

export function Header() {
  const { theme, toggle } = useTheme();
  const { enabled, setEnabled } = useVendor();
  const { count, setOpen } = useCart();

  return (
    <>
      <div className={styles.announce}>
        <div className="container">
          <span>Free shipping across Canada on orders over $499</span>
          <span className={styles.sep} aria-hidden="true" />
          <span>Save Ontario rebates instantly at checkout</span>
          <span className={styles.sep} aria-hidden="true" />
          <span>Same-day pickup at 9 branches</span>
        </div>
      </div>
      <header className={styles.header}>
        <div className={`container ${styles.row}`}>
          <Link to="/" className={styles.brand} aria-label="Lumen & Co. home">
            <Logo />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <MegaMenu />
            <QueryLink to="/shop?app=Commercial">Commercial</QueryLink>
            <QueryLink to="/shop?app=Industrial">Industrial</QueryLink>
            <QueryLink to="/shop?tag=rebate">Rebates</QueryLink>
          </nav>

          <SearchBox />

          <div className={styles.actions}>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={styles.vendorSwitch}
              title="Toggle vendor view (cost & stock by location)"
            >
              <Briefcase size={15} />
              <span className={styles.vendorLabel}>Vendor</span>
              <span className={styles.track} aria-hidden="true">
                <span className={styles.knob} />
              </span>
            </button>

            <Button variant="ghost" icon onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            <Button variant="ghost" icon onClick={() => setOpen(true)} aria-label={`Cart, ${count} items`} className={styles.cartBtn}>
              <ShoppingBag size={18} />
              {count > 0 && (
                <span key={count} className={styles.count}>
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
