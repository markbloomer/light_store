import { cctLabel, cctToCss } from '../../lib/color';
import { finishSwatch } from '../../lib/finish';
import { num } from '../../lib/format';
import styles from './ArtControls.module.css';

type Props = {
  cctOptions: number[];
  cct: number;
  onCct: (k: number) => void;
  finishes: string[];
  finish: string;
  onFinish: (f: string) => void;
};

/** Glass control bar that sits on top of a fixture illustration. */
export function ArtControls({ cctOptions, cct, onCct, finishes, finish, onFinish }: Props) {
  const showFinish = finishes.some((f) => f !== '—');

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <div className={styles.swatches} role="radiogroup" aria-label="Colour temperature">
          {cctOptions.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={k === cct}
              aria-label={`${num(k)}K ${cctLabel(k)}`}
              title={`${num(k)}K · ${cctLabel(k)}`}
              className={`${styles.swatch} ${styles.cct}`}
              style={{ ['--c' as string]: cctToCss(k) }}
              onClick={() => onCct(k)}
            />
          ))}
        </div>
        <span key={cct} className={styles.value}>
          <strong className="mono">{num(cct)}K</strong>
          <small>{cctLabel(cct)}</small>
        </span>
      </div>

      {showFinish && (
        <>
          <span className={styles.divider} aria-hidden="true" />
          <div className={styles.group}>
            <div className={styles.swatches} role="radiogroup" aria-label="Finish">
              {finishes.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={f === finish}
                  aria-label={f}
                  title={f}
                  className={styles.swatch}
                  style={{ background: finishSwatch(f) }}
                  onClick={() => onFinish(f)}
                />
              ))}
            </div>
            <span key={finish} className={`${styles.value} ${styles.finishValue}`}>
              <strong>{finish}</strong>
              <small>Finish</small>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
