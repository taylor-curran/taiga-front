// Loads /conf.json (served by Taiga backend) at app boot. Mirrors the legacy
// `tgConfig`/`$config` service in `app/coffee/modules/base/conf.coffee`.

export interface TaigaConfig {
  api: string;
  eventsUrl?: string;
  eventsMaxMissedHeartbeats?: number;
  eventsHeartbeatIntervalTime?: number;
  eventsReconnectTryInterval?: number;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  defaultLanguage?: string;
  themes?: string[];
  defaultTheme?: string;
  publicRegisterEnabled?: boolean;
  feedbackEnabled?: boolean;
  privacyPolicyCodeOfConduct?: boolean;
  supportUrl?: string;
  emailFiltersEnabled?: boolean;
  importers?: string[];
  contribPlugins?: string[];
  gravatar?: boolean;
  rtlLanguages?: string[];
  loginFormType?: string;
  gitHubClientId?: string | null;
  gitLabClientId?: string | null;
  gitLabUrl?: string | null;
}

const DEFAULTS: TaigaConfig = {
  api: '/api/v1/',
  eventsUrl: undefined,
  defaultLanguage: 'en',
  publicRegisterEnabled: true,
  gravatar: false,
};

let _config: TaigaConfig = { ...DEFAULTS };
let _loaded = false;

export async function loadConfig(): Promise<TaigaConfig> {
  if (_loaded) return _config;
  try {
    const res = await fetch('/conf.json', { credentials: 'omit' });
    if (res.ok) {
      const data = await res.json();
      _config = { ...DEFAULTS, ...data };
    }
  } catch {
    // Fall back to defaults; backend may be unreachable in dev.
  }
  _loaded = true;
  return _config;
}

export function getConfig(): TaigaConfig {
  return _config;
}
