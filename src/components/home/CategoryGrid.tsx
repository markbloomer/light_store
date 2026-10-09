import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import { FixtureArt } from '../product/FixtureArt';
import { SectionHeader } from './SectionHeader';
import styles from './CategoryGrid.module.css';

const COUNTS = PRODUCTS.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

export function CategoryGrid() {
  return (
    <section className="container">
      <SectionHeader eyebrow="Browse" title="Shop by category" action={{ to: '/shop', label: 'All products' }} />
      <div className={styles.grid}>
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.id}
            to={`/shop?cat=${c.id}`}
            className={`${styles.tile} reveal`}
            style={{ animationDelay: `${i * 35}ms` }}
            data-feature={i < 2}
          >
            <div className={styles.art}>
              <FixtureArt kind={c.fixture} cct={c.application === 'Residential' ? 2700 : 4000} />
            </div>
            <div className={styles.label}>
              <span>
                <strong>{c.name}</strong>
                <small>{c.blurb}</small>
              </span>
              <span className={styles.arrow}>
                <ArrowUpRight size={16} />
              </span>
            </div>
            <span className={`mono ${styles.count}`}>{String(COUNTS[c.id] ?? 0).padStart(2, '0')}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
