export interface RuntimeConfig {
  api: string;
  eventsUrl: string;
  baseHref: string;
  defaultLanguage: string;
  themes: string[];
  defaultTheme: string;
  defaultLoginEnabled: boolean;
  publicRegisterEnabled: boolean;
  feedbackEnabled: boolean;
  supportUrl?: string;
  [k: string]: unknown;
}

const FALLBACK: RuntimeConfig = {
  api: '/api/v1/',
  eventsUrl: '',
  baseHref: '/',
  defaultLanguage: 'en',
  themes: ['taiga'],
  defaultTheme: 'taiga',
  defaultLoginEnabled: true,
  publicRegisterEnabled: false,
  feedbackEnabled: false,
};

let cached: RuntimeConfig | null = null;

export async function loadConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;
  try {
    const res = await fetch('/conf.json', { credentials: 'omit' });
    if (!res.ok) throw new Error('conf.json not available');
    const data = (await res.json()) as Partial<RuntimeConfig>;
    cached = { ...FALLBACK, ...data };
    // Always route the API through the same origin so the Vite proxy (or the
    // production reverse proxy) handles it. The Taiga gateway publishes an
    // absolute URL in conf.json, which would bypass our proxy in dev.
    cached.api = '/api/v1/';
  } catch {
    cached = { ...FALLBACK };
  }
  return cached;
}

export function getConfigSync(): RuntimeConfig {
  return cached ?? FALLBACK;
}
