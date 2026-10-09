import { useId, type ReactNode } from 'react';
import type { FixtureKind } from '../../data/types';
import { cctToCss } from '../../lib/color';
import { finishStops } from '../../lib/finish';
import styles from './FixtureArt.module.css';

type Props = {
  kind: FixtureKind;
  cct?: number;
  intensity?: number;
  finish?: string;
  className?: string;
};

type Ids = { glow: string; beam: string; pool: string; body: string; emit: string };

/**
 * Vector illustrations for each fixture family. Every drawing shares the same
 * three light layers (source glow, beam, floor pool) tinted by colour temperature.
 */
export function FixtureArt({ kind, cct = 3000, intensity = 1, finish, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const metal = finishStops(finish);
  const light = (a: number) => cctToCss(cct, Math.min(1, a * intensity));
  const ids: Ids = { glow: `g${uid}`, beam: `b${uid}`, pool: `p${uid}`, body: `m${uid}`, emit: cctToCss(cct) };

  return (
    <svg viewBox="0 0 200 200" className={`${styles.art} ${className ?? ''}`} aria-hidden="true">
      <defs>
        <radialGradient id={ids.glow}>
          <stop offset="0%" stopColor={light(1)} />
          <stop offset="35%" stopColor={light(0.45)} />
          <stop offset="100%" stopColor={light(0)} />
        </radialGradient>
        <linearGradient id={ids.beam} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light(0.55)} />
          <stop offset="100%" stopColor={light(0)} />
        </linearGradient>
        <radialGradient id={ids.pool}>
          <stop offset="0%" stopColor={light(0.5)} />
          <stop offset="100%" stopColor={light(0)} />
        </radialGradient>
        <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className={styles.stop} style={{ stopColor: metal[0] }} />
          <stop offset="45%" className={styles.stop} style={{ stopColor: metal[1] }} />
          <stop offset="100%" className={styles.stop} style={{ stopColor: metal[2] }} />
        </linearGradient>
      </defs>
      <g className={styles.lightLayer}>{DRAW[kind](ids, 'light')}</g>
      <g>{DRAW[kind](ids, 'body')}</g>
    </svg>
  );
}

type Layer = 'light' | 'body';
const url = (id: string) => `url(#${id})`;
const S = { stroke: 'var(--art-stroke)', strokeWidth: 1.2 } as const;

const DRAW: Record<FixtureKind, (ids: Ids, layer: Layer) => ReactNode> = {
  pendant: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M70 112 L30 196 L170 196 L130 112 Z" fill={url(ids.beam)} />
        <ellipse cx="100" cy="190" rx="70" ry="8" fill={url(ids.pool)} />
        <circle cx="100" cy="112" r="46" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <line x1="100" y1="0" x2="100" y2="62" {...S} />
        <rect x="94" y="60" width="12" height="10" rx="2" fill={url(ids.body)} {...S} />
        <path d="M56 112 C56 84 76 68 100 68 C124 68 144 84 144 112 Z" fill={url(ids.body)} {...S} />
        <ellipse cx="100" cy="112" rx="30" ry="3.5" fill={ids.emit} />
      </>
    ),

  chandelier: (ids, layer) => {
    const arms = [44, 70, 100, 130, 156];
    return layer === 'light' ? (
      <>
        <ellipse cx="100" cy="150" rx="90" ry="40" fill={url(ids.glow)} opacity="0.55" />
        {arms.map((x, i) => (
          <circle key={x} cx={x} cy={i % 2 ? 128 : 120} r="18" fill={url(ids.glow)} />
        ))}
        <ellipse cx="100" cy="192" rx="80" ry="7" fill={url(ids.pool)} />
      </>
    ) : (
      <>
        <line x1="100" y1="0" x2="100" y2="66" {...S} />
        <ellipse cx="100" cy="76" rx="62" ry="12" fill="none" {...S} strokeWidth={2} />
        {arms.map((x, i) => {
          const y = i % 2 ? 128 : 120;
          return (
            <g key={x}>
              <line x1={x} y1={78} x2={x} y2={y - 22} {...S} />
              <rect x={x - 6} y={y - 22} width="12" height="22" rx="3" fill={url(ids.body)} {...S} />
              <rect x={x - 5} y={y - 1} width="10" height="3" rx="1.5" fill={ids.emit} />
            </g>
          );
        })}
      </>
    );
  },

  sconce: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M86 86 L60 0 L150 0 L114 86 Z" fill={url(ids.beam)} transform="rotate(180 100 43)" />
        <path d="M86 118 L56 200 L144 200 L114 118 Z" fill={url(ids.beam)} />
        <circle cx="100" cy="86" r="26" fill={url(ids.glow)} />
        <circle cx="100" cy="118" r="26" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <rect x="18" y="0" width="10" height="200" fill="var(--art-fill)" opacity="0.6" />
        <rect x="28" y="88" width="16" height="28" rx="3" fill={url(ids.body)} {...S} />
        <rect x="44" y="98" width="42" height="8" rx="2" fill={url(ids.body)} {...S} />
        <rect x="86" y="84" width="28" height="36" rx="6" fill={url(ids.body)} {...S} />
        <rect x="88" y="83" width="24" height="2" rx="1" fill={ids.emit} />
        <rect x="88" y="119" width="24" height="2" rx="1" fill={ids.emit} />
      </>
    ),

  downlight: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M78 48 L22 196 L178 196 L122 48 Z" fill={url(ids.beam)} />
        <ellipse cx="100" cy="188" rx="78" ry="10" fill={url(ids.pool)} />
        <ellipse cx="100" cy="52" rx="44" ry="18" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <rect x="0" y="0" width="200" height="44" fill="var(--art-fill)" opacity="0.5" />
        <line x1="0" y1="44" x2="200" y2="44" {...S} />
        <ellipse cx="100" cy="46" rx="30" ry="5" fill={url(ids.body)} {...S} />
        <ellipse cx="100" cy="46" rx="22" ry="3" fill={ids.emit} />
      </>
    ),

  panel: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M40 76 L8 198 L192 198 L160 76 Z" fill={url(ids.beam)} />
        <ellipse cx="100" cy="76" rx="80" ry="24" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <path d="M44 58 L156 58 L176 80 L24 80 Z" fill={url(ids.body)} {...S} />
        <path d="M30 78 L170 78 L162 70 L38 70 Z" fill={ids.emit} opacity="0.95" />
        <line x1="10" y1="58" x2="190" y2="58" {...S} opacity="0.5" />
        <line x1="0" y1="80" x2="200" y2="80" {...S} opacity="0.3" />
      </>
    ),

  linear: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M30 96 L4 198 L196 198 L170 96 Z" fill={url(ids.beam)} />
        <ellipse cx="100" cy="96" rx="84" ry="16" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <line x1="44" y1="0" x2="44" y2="88" {...S} />
        <line x1="156" y1="0" x2="156" y2="88" {...S} />
        <rect x="24" y="86" width="152" height="10" rx="2" fill={url(ids.body)} {...S} />
        <rect x="26" y="95" width="148" height="2.5" rx="1" fill={ids.emit} />
      </>
    ),

  track: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M58 70 L4 196 L84 196 L74 70 Z" fill={url(ids.beam)} />
        <path d="M126 70 L116 196 L196 196 L142 70 Z" fill={url(ids.beam)} />
        <circle cx="66" cy="72" r="18" fill={url(ids.glow)} />
        <circle cx="134" cy="72" r="18" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <rect x="10" y="22" width="180" height="8" rx="2" fill={url(ids.body)} {...S} />
        {[66, 134].map((x, i) => (
          <g key={x} transform={`rotate(${i ? -14 : 14} ${x} 36)`}>
            <rect x={x - 3} y="30" width="6" height="10" fill={url(ids.body)} {...S} />
            <rect x={x - 11} y="40" width="22" height="32" rx="4" fill={url(ids.body)} {...S} />
            <rect x={x - 9} y="70" width="18" height="2.5" rx="1" fill={ids.emit} />
          </g>
        ))}
      </>
    ),

  highbay: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M56 104 L0 200 L200 200 L144 104 Z" fill={url(ids.beam)} />
        <ellipse cx="100" cy="106" rx="60" ry="20" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <path d="M100 0 L100 34" {...S} />
        <circle cx="100" cy="38" r="5" fill="none" {...S} />
        <rect x="80" y="44" width="40" height="16" rx="3" fill={url(ids.body)} {...S} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={60 + i * 9.5} y="60" width="4" height="30" rx="1" fill={url(ids.body)} {...S} strokeWidth={0.8} />
        ))}
        <path d="M52 90 L148 90 L144 104 L56 104 Z" fill={url(ids.body)} {...S} />
        <ellipse cx="100" cy="104" rx="42" ry="3" fill={ids.emit} />
      </>
    ),

  wallpack: (ids, layer) =>
    layer === 'light' ? (
      <>
        <path d="M70 112 L10 200 L150 200 L130 112 Z" fill={url(ids.beam)} />
        <ellipse cx="96" cy="114" rx="50" ry="16" fill={url(ids.glow)} />
      </>
    ) : (
      <>
        <rect x="160" y="0" width="40" height="200" fill="var(--art-fill)" opacity="0.6" />
        <path d="M60 78 L160 70 L160 112 L66 112 Z" fill={url(ids.body)} {...S} />
        <path d="M68 108 L156 108 L156 112 L66 112 Z" fill={ids.emit} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={84 + i * 18} y1={78 - i * 1.4} x2={84 + i * 18} y2="100" {...S} strokeWidth={0.7} />
        ))}
      </>
    ),

  bulb: (ids, layer) =>
    layer === 'light' ? (
      <>
        <circle cx="100" cy="104" r="80" fill={url(ids.glow)} opacity="0.75" />
      </>
    ) : (
      <>
        <rect x="88" y="16" width="24" height="24" rx="2" fill={url(ids.body)} {...S} />
        {[22, 28, 34].map((y) => (
          <line key={y} x1="88" y1={y} x2="112" y2={y} {...S} strokeWidth={0.8} />
        ))}
        <path
          d="M88 40 C88 54 62 66 62 104 C62 132 80 150 100 150 C120 150 138 132 138 104 C138 66 112 54 112 40 Z"
          fill="rgba(255,255,255,0.04)"
          {...S}
        />
        <path
          d="M94 44 L94 90 C88 96 90 104 96 102 C102 100 104 110 98 116 C92 122 106 126 106 118 C106 110 112 104 106 96 L106 44"
          fill="none"
          stroke={ids.emit}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    ),
};