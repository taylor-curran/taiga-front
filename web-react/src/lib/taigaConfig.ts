export type PublicTaigaConfig = {
    api: string;
    publicRegisterEnabled?: boolean;
    defaultLanguage?: string;
    defaultLoginEnabled?: boolean;
    loginFormType?: string;
    defaultTheme?: string;
    themes?: string[];
    eventsUrl: string | null;
    debug: boolean;
};

const defaultConfig: PublicTaigaConfig = {
    api: '/api/v1/',
    publicRegisterEnabled: true,
    defaultLanguage: 'en',
    defaultLoginEnabled: true,
    loginFormType: 'normal',
    defaultTheme: 'taiga',
    themes: ['taiga'],
    eventsUrl: null,
    debug: true,
};

let cached: { config: PublicTaigaConfig; promise: Promise<PublicTaigaConfig> } | null = null;

/**
 * Fetches `conf.json` (proxied to backend in dev) like the Angular app; falls back to sane defaults in tests.
 */
export function getTaigaConfig(): Promise<PublicTaigaConfig> {
    if (typeof window === 'undefined') {
        return Promise.resolve({ ...defaultConfig });
    }
    if (cached) {
        return cached.promise;
    }
    const promise = fetch(new URL('conf.json', window.location.origin).toString(), {
        credentials: 'same-origin',
    })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: Partial<PublicTaigaConfig> | null) => {
            if (!j || typeof j.api !== 'string') {
                if (import.meta.env.DEV) {
                    // Vite + json-server: serve conf from :3000 when available
                    return fetch('http://127.0.0.1:3000/conf.json')
                        .then((r) => (r.ok ? r.json() : null))
                        .then((c: Partial<PublicTaigaConfig> | null) => ({
                            ...defaultConfig,
                            ...c,
                        }));
                }
                return { ...defaultConfig };
            }
            return { ...defaultConfig, ...j };
        })
        .catch(() => ({ ...defaultConfig }));
    cached = { config: { ...defaultConfig }, promise };
    return promise;
}

export function apiV1Base(config: PublicTaigaConfig): string {
    return config.api.replace(/\/?$/, '/');
}

/** Taiga 6+ sometimes exposes a React root for config — safe no-op. */
export function setTaigaConfigShimForTests(_: PublicTaigaConfig) {
    /* reserved for E2E / Storybook if needed */
}

export function isPublicRegisterEnabled(config: PublicTaigaConfig) {
    return config.publicRegisterEnabled === true;
}

export function isDefaultLoginEnabled(config: PublicTaigaConfig) {
    return config.defaultLoginEnabled !== false;
}

export function loginFormType(config: PublicTaigaConfig) {
    return config.loginFormType || 'normal';
}
