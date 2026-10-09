import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './SectionHeader.module.css';

type Props = { eyebrow: string; title: string; action?: { to: string; label: string } };

export function SectionHeader({ eyebrow, title, action }: Props) {
  return (
    <header className={styles.head}>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <Link to={action.to} className={styles.action}>
          {action.label} <ArrowRight size={15} />
        </Link>
      )}
    </header>
  );
}
