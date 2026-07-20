export type FixtureDb = {
  user: { id: number; username?: string; auth_token?: string };
  projects: Record<string, unknown>[];
  memberships: Record<string, unknown>[];
  roles: Record<string, unknown>[];
  userstory: Record<string, unknown>;
  task: Record<string, unknown>;
  issue: Record<string, unknown>;
  epic: Record<string, unknown>;
};

let cache: FixtureDb | null = null;

export async function loadFixtureDb(): Promise<FixtureDb> {
  if (cache) return cache;
  const r = await fetch('/db.json');
  if (!r.ok) throw new Error('fixture db.json missing');
  cache = (await r.json()) as FixtureDb;
  return cache;
}

export function clearFixtureDbCache(): void {
  cache = null;
}
