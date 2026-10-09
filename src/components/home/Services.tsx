import { BadgePercent, Building2, LayoutGrid, Store } from 'lucide-react';
import styles from './Services.module.css';

const ITEMS = [
  {
    icon: LayoutGrid,
    title: 'Free photometric layouts',
    body: 'Send a floor plan — our designers return a lux-accurate layout and fixture schedule within 48 hours.',
  },
  {
    icon: BadgePercent,
    title: 'Utility rebates, handled',
    body: 'DLC-listed products are pre-qualified. We file Save on Energy and Hydro-Québec paperwork for you.',
  },
  {
    icon: Store,
    title: 'Pickup in 9 branches',
    body: 'Order before 2 PM for same-day counter pickup across Ontario, Québec, Alberta and BC.',
  },
  {
    icon: Building2,
    title: 'Contractor accounts',
    body: 'Tiered pricing, net-30 terms, job-site delivery and live stock by branch with vendor view.',
  },
];

export function Services() {
  return (
    <section className="container">
      <div className={styles.panel}>
        <div className={styles.intro}>
          <span className="eyebrow">For designers & trades</span>
          <h2>
            More than a store —<br />a lighting partner.
          </h2>
          <p>
            From a single pendant to a 200,000 sq ft warehouse retrofit, we bring spec expertise and Canadian inventory
            to every order.
          </p>
        </div>
        <ul className={styles.list}>
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className={styles.item}>
              <span className={styles.icon}>
                <Icon size={18} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
