import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TaigaConfig } from '../api/types';

const ConfigContext = createContext<TaigaConfig | null>(null);

async function fetchConfig(): Promise<TaigaConfig> {
  const res = await fetch('/conf.json', { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`conf.json: ${res.status}`);
  return (await res.json()) as TaigaConfig;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const q = useQuery({ queryKey: ['taiga-config'], queryFn: fetchConfig, staleTime: Infinity });
  if (q.isPending) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        Loading…
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div style={{ padding: '2rem', color: '#c00', fontFamily: 'sans-serif' }}>
        Could not load Taiga configuration (/conf.json).
      </div>
    );
  }
  return <ConfigContext.Provider value={q.data}>{children}</ConfigContext.Provider>;
}

export function useTaigaConfig(): TaigaConfig {
  const c = useContext(ConfigContext);
  if (!c) throw new Error('useTaigaConfig must be used within ConfigProvider');
  return c;
}
