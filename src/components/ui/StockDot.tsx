import type { ReactNode } from 'react';
import type { StockLevel } from '../../lib/inventory';
import styles from './StockDot.module.css';

const LABEL: Record<StockLevel, string> = {
  out: 'Out of stock',
  low: 'Low stock',
  ok: 'In stock',
  high: 'In stock',
};

export function StockDot({ level, children }: { level: StockLevel; children?: ReactNode }) {
  return (
    <span className={`${styles.root} ${styles[level]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {children ?? LABEL[level]}
    </span>
  );
}
