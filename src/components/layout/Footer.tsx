import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { LOCATIONS } from '../../data/locations';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p>
            Architectural, commercial and decorative lighting — specified by lighting designers, stocked in Canada,
            and backed by real people.
          </p>
          <form className={styles.news} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@studio.ca" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div>
          <h4 className="eyebrow">Shop</h4>
          <ul>
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/shop?cat=${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Services</h4>
          <ul>
            <li>Free lighting layouts</li>
            <li>Utility rebate filing</li>
            <li>Contractor pricing</li>
            <li>Spec sheets & IES files</li>
            <li>Project quotes</li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow">Branches</h4>
          <ul className={styles.branches}>
            {LOCATIONS.map((l) => (
              <li key={l.id}>
                {l.city}, {l.province}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`container ${styles.legal}`}>
        <span>© 2026 Lumen & Co. Lighting Inc. — prototype.</span>
        <span>Prices in CAD. All fixtures cULus / cETL certified for Canada.</span>
      </div>
    </footer>
  );
}
