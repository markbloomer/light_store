import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_BY_ID } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import { money } from '../../lib/format';
import { searchProducts } from '../../lib/search';
import { FixtureArt } from '../product/FixtureArt';
import styles from './SearchBox.module.css';

export function SearchBox() {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => (q.trim() ? searchProducts(PRODUCTS, q).slice(0, 6) : []), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q]);

  const go = (path: string) => {
    navigate(path);
    setQ('');
    inputRef.current?.blur();
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(`/product/${results[active].id}`);
      else if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`);
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const showPanel = focused && q.trim().length > 0;

  return (
    <div className={styles.root}>
      <label className={styles.field} data-focused={focused}>
        <Search size={16} className={styles.icon} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={onKeyDown}
          placeholder="Search fixtures, SKUs, brands…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-results"
        />
        <kbd className={styles.kbd}>Ctrl K</kbd>
      </label>

      {showPanel && (
        <div className={styles.panel} id="search-results" role="listbox">
          {results.length === 0 ? (
            <p className={styles.empty}>No matches for “{q}”.</p>
          ) : (
            results.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={i === active}
                className={styles.result}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(`/product/${p.id}`)}
              >
                <span className={styles.thumb}>
                  <FixtureArt kind={p.fixture} cct={p.cctOptions[0]} />
                </span>
                <span className={styles.meta}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.sub}>
                    {CATEGORY_BY_ID[p.category].name} · <span className="mono">{p.sku}</span>
                  </span>
                </span>
                <span className={styles.price}>{money(p.price)}</span>
              </button>
            ))
          )}
          <button
            type="button"
            className={styles.all}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}
          >
            See all results for “{q.trim()}” →
          </button>
        </div>
      )}
    </div>
  );
}
