export interface TaigaConfig {
  api: string;
  eventsUrl: string;
  baseHref: string;
  eventsMaxMissedHeartbeats: number;
  eventsHeartbeatIntervalTime: number;
  eventsReconnectTryInterval: number;
  debug: boolean;
  debugInfo: boolean;
  defaultLanguage: string;
  themes: string[];
  defaultTheme: string;
  defaultLoginEnabled: boolean;
  publicRegisterEnabled: boolean;
  feedbackEnabled: boolean;
  supportUrl: string | null;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  maxUploadFileSize: number | null;
  contribPlugins: unknown[];
  gitHubClientId: string;
  gitLabClientId: string;
  gitLabUrl: string;
  tagManager: { accountId: string | null };
  tribeHost: string | null;
  enableAsanaImporter: boolean;
  enableGithubImporter: boolean;
  enableJiraImporter: boolean;
  enableTrelloImporter: boolean;
  gravatar: boolean;
  rtlLanguages: string[];
}

let cached: TaigaConfig | null = null;
let inflight: Promise<TaigaConfig> | null = null;

export async function loadConfig(): Promise<TaigaConfig> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch('/conf.json', { credentials: 'omit' })
    .then((r) => {
      if (!r.ok) throw new Error('failed to load /conf.json');
      return r.json();
    })
    .then((cfg: TaigaConfig) => {
      // Match the AngularJS behaviour: if the API returns an absolute URL we keep it.
      // The Vite dev proxy forwards /api/v1/ to the gateway so relative URLs work too.
      cached = cfg;
      inflight = null;
      return cfg;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function getConfig(): TaigaConfig {
  if (!cached) {
    throw new Error('Config not loaded yet — call loadConfig() at boot.');
  }
  return cached;
}

export function apiBase(): string {
  // Default to the Vite-proxied path. The /conf.json from the gateway returns an
  // absolute http://localhost:9000/api/v1/ URL; we strip the origin so that the
  // request goes through the Vite proxy in dev and the gateway's same-origin
  // routing in production builds.
  if (!cached) return '/api/v1/';
  try {
    const u = new URL(cached.api, window.location.origin);
    return u.pathname;
  } catch {
    return cached.api;
  }
}

export function eventsUrl(): string {
  if (!cached) return '';
  const raw = cached.eventsUrl || '';
  if (!raw) return '';
  if (raw.startsWith('ws:') || raw.startsWith('wss:')) {
    // If the configured WS host equals the gateway, rewrite to same-origin so
    // the Vite proxy can forward it transparently to the WS upgrade endpoint.
    try {
      const u = new URL(raw);
      const apiUrl = new URL(cached.api, window.location.origin);
      if (u.host === apiUrl.host) {
        const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${scheme}//${window.location.host}${u.pathname}`;
      }
    } catch {
      /* ignore */
    }
    return raw;
  }
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const path = raw.replace(/^\//, '');
  return `${scheme}//${window.location.host}/${path}`;
}
