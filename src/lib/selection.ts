import type { Product } from '../data/types';

export type Selection = { cct: number; finish: string };

export function cycle<T>(options: T[], current: T): T {
  return options[(options.indexOf(current) + 1) % options.length];
}

export function readSelection(p: Product, sp: URLSearchParams): Selection {
  const cct = Number(sp.get('cct'));
  const finish = sp.get('finish') ?? '';
  return {
    cct: p.cctOptions.includes(cct) ? cct : p.cctOptions[0],
    finish: p.finishes.includes(finish) ? finish : p.finishes[0],
  };
}

/** Only non-default options are written, keeping default product URLs clean. */
export function writeSelection(p: Product, sel: Selection, base?: URLSearchParams) {
  const sp = new URLSearchParams(base);
  if (sel.cct === p.cctOptions[0]) sp.delete('cct');
  else sp.set('cct', String(sel.cct));
  if (sel.finish === p.finishes[0]) sp.delete('finish');
  else sp.set('finish', sel.finish);
  return sp;
}

/** Product URLs carry the chosen options so a card's choice survives navigation and sharing. */
export function productHref(p: Product, sel: Selection) {
  const q = writeSelection(p, sel).toString();
  return `/product/${p.id}${q ? `?${q}` : ''}`;
}
