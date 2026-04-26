import type { ReactNode } from 'react';
import { SessionBootstrap } from '@/providers/SessionBootstrap';

type Props = { children: ReactNode };

/**
 * App-level provider shell. Zustand stores do not need a React context; this
 * keeps a single place for future providers (i18n, query client, etc.).
 */
export function AppProviders({ children }: Props) {
    return <SessionBootstrap>{children}</SessionBootstrap>;
}
