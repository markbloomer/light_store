import { CategoryGrid } from '../components/home/CategoryGrid';
import { Hero } from '../components/home/Hero';
import { SectionHeader } from '../components/home/SectionHeader';
import { Services } from '../components/home/Services';
import { ProductCard } from '../components/product/ProductCard';
import { PRODUCTS } from '../data/products';
import styles from './HomePage.module.css';

const FEATURED = PRODUCTS.filter((p) => p.tags.includes('bestseller')).slice(0, 8);
const NEW = PRODUCTS.filter((p) => p.tags.includes('new')).slice(0, 4);

export function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <section className="container">
        <SectionHeader eyebrow="Most specified" title="Bestsellers" action={{ to: '/shop?tag=bestseller', label: 'View all' }} />
        <div className={styles.grid}>
          {FEATURED.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
      <Services />
      <section className="container">
        <SectionHeader eyebrow="Just landed" title="New arrivals" action={{ to: '/shop?tag=new', label: 'Shop new' }} />
        <div className={styles.grid}>
          {NEW.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
