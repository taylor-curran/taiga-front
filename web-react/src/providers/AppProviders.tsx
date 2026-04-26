import type { ReactNode } from 'react';

/**
 * Top-level providers. Zustand stores need no React context; this wrapper
 * exists for future i18n / query clients and keeps main.tsx tidy.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return children;
}
