export type TaigaConf = {
  api: string;
  defaultLanguage?: string;
  defaultLoginEnabled?: boolean;
  loginFormType?: string;
  publicRegisterEnabled?: boolean;
};

let cached: TaigaConf | null = null;

export async function loadConf(): Promise<TaigaConf> {
  if (cached) return cached;
  const res = await fetch('/conf.json', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to load conf.json');
  cached = (await res.json()) as TaigaConf;
  return cached;
}

export function getConf(): TaigaConf | null {
  return cached;
}

/** Test helper */
export function setConfForTests(c: TaigaConf | null) {
  cached = c;
}

