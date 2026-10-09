import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FREE_SHIPPING_AT, useCart } from '../../context/CartContext';
import { kelvin, money } from '../../lib/format';
import { FixtureArt } from '../product/FixtureArt';
import { Button, ButtonLink } from '../ui/Button';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove } = useCart();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.inert = !open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_AT);

  return (
    <div ref={rootRef} className={styles.root} data-open={open} aria-hidden={!open}>
      <div className={styles.scrim} onClick={() => setOpen(false)} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header className={styles.head}>
          <h2>Your cart</h2>
          <Button variant="ghost" icon size="sm" onClick={() => setOpen(false)} aria-label="Close cart">
            <X size={18} />
          </Button>
        </header>

        <div className={styles.ship}>
          <p>
            {remaining > 0 ? (
              <>
                You're <strong>{money(remaining)}</strong> away from free shipping
              </>
            ) : (
              <>You've unlocked <strong>free shipping</strong></>
            )}
          </p>
          <div className={styles.meter}>
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyArt}>
              <FixtureArt kind="bulb" cct={2200} intensity={0.5} />
            </div>
            <p>Your cart is empty.</p>
            <ButtonLink to="/shop" variant="primary" onClick={() => setOpen(false)}>
              Browse lighting
            </ButtonLink>
          </div>
        ) : (
          <ul className={styles.lines}>
            {lines.map((l) => (
              <li key={l.key} className={styles.line}>
                <div className={styles.thumb}>
                  <FixtureArt kind={l.product.fixture} cct={l.cct} />
                </div>
                <div className={styles.info}>
                  <Link to={`/product/${l.product.id}`} onClick={() => setOpen(false)} className={styles.name}>
                    {l.product.name}
                  </Link>
                  <span className={styles.opts}>
                    {kelvin(l.cct)} · {l.finish}
                  </span>
                  <div className={styles.qty}>
                    <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease quantity">
                      <Minus size={13} />
                    </button>
                    <span className="mono">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase quantity">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <div className={styles.right}>
                  <span className={styles.price}>{money(l.qty * l.product.price)}</span>
                  <button type="button" className={styles.remove} onClick={() => remove(l.key)} aria-label="Remove item">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <footer className={styles.foot}>
            <div className={styles.total}>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p className={styles.note}>Taxes, rebates & shipping calculated at checkout.</p>
            <Button variant="primary" size="lg" block>
              Checkout
            </Button>
          </footer>
        )}
      </aside>
    </div>
  );
}
