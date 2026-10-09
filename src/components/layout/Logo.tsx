import styles from './Logo.module.css';

export function Logo() {
  return (
    <span className={styles.logo}>
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.core} />
      </span>
      <span className={styles.word}>
        Lumen<span className={styles.amp}>&</span>Co.
      </span>
    </span>
  );
}
