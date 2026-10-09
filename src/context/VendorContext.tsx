import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ALL_SCOPE, parseScope, scopeKey, type Scope } from '../lib/inventory';

type VendorCtx = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  scope: Scope;
  setScope: (s: Scope) => void;
};

const Ctx = createContext<VendorCtx | null>(null);
const KEY = 'lumen.vendor';

export function VendorProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '{}') as { enabled?: boolean; scope?: string };
    } catch {
      return {};
    }
  }, []);

  const [enabled, setEnabled] = useState(Boolean(saved.enabled));
  const [scope, setScope] = useState<Scope>(saved.scope ? parseScope(saved.scope) : ALL_SCOPE);

  useEffect(() => {
    document.documentElement.dataset.vendor = String(enabled);
    localStorage.setItem(KEY, JSON.stringify({ enabled, scope: scopeKey(scope) }));
  }, [enabled, scope]);

  const value = useMemo(() => ({ enabled, setEnabled, scope, setScope }), [enabled, scope]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVendor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVendor must be used inside VendorProvider');
  return ctx;
}
