import type { ReactNode } from 'react';
import styles from './Segmented.module.css';

type Option<T extends string | number> = { value: T; label: ReactNode; title?: string };

type Props<T extends string | number> = {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  label: string;
};

export function Segmented<T extends string | number>({ value, options, onChange, size = 'md', label }: Props<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      className={`${styles.root} ${styles[size]}`}
      role="radiogroup"
      aria-label={label}
      style={{ ['--count' as string]: options.length, ['--index' as string]: index }}
    >
      <span className={styles.thumb} aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          title={o.title}
          className={styles.option}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
