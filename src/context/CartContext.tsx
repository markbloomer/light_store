import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCT_BY_ID } from '../data/products';
import type { Product } from '../data/types';

export type CartLine = { key: string; productId: string; cct: number; finish: string; qty: number };
export type ResolvedLine = CartLine & { product: Product };

type CartCtx = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, opts: { cct: number; finish: string; qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'lumen.cart';

export const FREE_SHIPPING_AT = 499;

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartLine[];
      return parsed.filter((l) => PRODUCT_BY_ID[l.productId]);
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(raw));
  }, [raw]);

  const add = useCallback<CartCtx['add']>((p, { cct, finish, qty = 1 }) => {
    const key = `${p.id}|${cct}|${finish}`;
    setRaw((prev) => {
      const hit = prev.find((l) => l.key === key);
      if (hit) return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { key, productId: p.id, cct, finish, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setRaw((prev) => (qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const remove = useCallback((key: string) => setRaw((prev) => prev.filter((l) => l.key !== key)), []);

  const value = useMemo(() => {
    const lines = raw.map((l) => ({ ...l, product: PRODUCT_BY_ID[l.productId] }));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
    };
  }, [raw, open, add, setQty, remove]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
