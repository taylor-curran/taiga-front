import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { setApiSessionHooks } from '@/api/apiClient';
import { postAuthRefresh } from '@/api/authApi';
import { readSessionSnapshotForApi, setTokenPair } from '@/lib/sessionStorage';
import { useAppStore } from '@/stores/appStore';

type Props = { children: ReactNode };

/**
 * Wires 401 → refresh (Taiga `auth/refresh`) like Angular `authHttpIntercept`, and rehydrates Zustand from `localStorage`.
 */
export function SessionBootstrap({ children }: Props) {
    const hooksReady = useRef(false);

    useLayoutEffect(() => {
        if (hooksReady.current) return;
        hooksReady.current = true;

        const hydrate = useAppStore.getState().hydrateFromStorage;
        hydrate();

        setApiSessionHooks({
            onUnauthorized: () => {
                useAppStore.getState().clearSession();
                const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                const q = new URLSearchParams({ next, unauthorized: 'true' });
                window.location.assign(`/login?${q.toString()}`);
            },
            refresh: async ({ config, prev }) => {
                if (!prev.refresh) return null;
                try {
                    const data = await postAuthRefresh(config, prev.refresh);
                    setTokenPair(data.auth_token, data.refresh);
                    return readSessionSnapshotForApi();
                } catch {
                    return null;
                }
            },
        });
    }, []);

    return children;
}
