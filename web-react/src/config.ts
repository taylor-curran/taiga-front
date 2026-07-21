export interface TaigaConfig {
  publicRegisterEnabled?: boolean;
  defaultLanguage?: string;
  defaultTheme?: string;
  feedbackEnabled?: boolean;
  supportUrl?: string;
  debug?: boolean;
}

let _config: TaigaConfig = {};
let _loaded = false;

export async function loadConfig(): Promise<TaigaConfig> {
  if (_loaded) return _config;
  try {
    const res = await fetch("/conf.json");
    if (res.ok) {
      _config = (await res.json()) as TaigaConfig;
    }
  } catch {
    console.warn("Could not load /conf.json – using defaults");
  }
  _loaded = true;
  return _config;
}

export function getConfig(): TaigaConfig {
  return _config;
}
