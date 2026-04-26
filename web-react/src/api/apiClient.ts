import { apiV1Base, type PublicTaigaConfig } from '@/lib/taigaConfig';
import { STORAGE_REFRESH, STORAGE_TOKEN, STORAGE_USER } from '@/lib/storageKeys';

export type ApiRequestInit = RequestInit & { skipAuth?: boolean; _retried?: boolean };

export type SessionSnapshot = {
    token: string | null;
    refresh: string | null;
    userJson: string | null;
};

type RefreshHandler = (args: {
    config: PublicTaigaConfig;
    prev: SessionSnapshot;
}) => Promise<SessionSnapshot | null>;

let refreshHandler: RefreshHandler | null = null;
let onUnauthorized: (() => void) | null = null;

export function setApiSessionHooks(hooks: { refresh: RefreshHandler; onUnauthorized: () => void }) {
    refreshHandler = hooks.refresh;
    onUnauthorized = hooks.onUnauthorized;
}

function readStorageSession(): SessionSnapshot {
    if (typeof localStorage === 'undefined') {
        return { token: null, refresh: null, userJson: null };
    }
    return {
        token: localStorage.getItem(STORAGE_TOKEN),
        refresh: localStorage.getItem(STORAGE_REFRESH),
        userJson: localStorage.getItem(STORAGE_USER),
    };
}

/**
 * JSON API fetch matching Taiga: Bearer token, `Accept-Language`, relative `/api/v1/...` URLs.
 * On 401, attempts one refresh (same as Angular `authHttpIntercept`) then retries once.
 */
export async function apiFetch(
    config: PublicTaigaConfig,
    path: string,
    init: ApiRequestInit = {},
): Promise<Response> {
    const base = apiV1Base(config);
    const url = path.startsWith('http')
        ? path
        : `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }
    const lang = config.defaultLanguage || 'en';
    if (!headers.has('Accept-Language')) {
        headers.set('Accept-Language', lang);
    }

    if (!init.skipAuth) {
        const t = readStorageSession().token;
        if (t) {
            headers.set('Authorization', `Bearer ${t}`);
        }
    }

    const res = await fetch(url, { ...init, headers });

    const isRefreshPath = path.includes('auth/refresh');
    if (
        res.status === 401 &&
        !init.skipAuth &&
        !init._retried &&
        !isRefreshPath &&
        refreshHandler
    ) {
        const prev = readStorageSession();
        const next = await refreshHandler({ config, prev });
        if (next?.token) {
            return apiFetch(config, path, { ...init, _retried: true });
        }
        onUnauthorized?.();
    } else if (res.status === 401 && !init.skipAuth && init._retried) {
        onUnauthorized?.();
    } else if (res.status === 401 && !init.skipAuth && !refreshHandler) {
        onUnauthorized?.();
    }

    return res;
}

export async function apiJson<T>(
    config: PublicTaigaConfig,
    path: string,
    init: ApiRequestInit = {},
): Promise<T> {
    const res = await apiFetch(config, path, init);
    const text = await res.text();
    let data: unknown = null;
    if (text) {
        try {
            data = JSON.parse(text) as T;
        } catch {
            data = text as unknown as T;
        }
    }
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`) as Error & { status: number; body: unknown };
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data as T;
}
