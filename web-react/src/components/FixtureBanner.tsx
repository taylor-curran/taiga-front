import { useSessionStore } from '../stores/sessionStore';

export function FixtureBanner() {
  if (!import.meta.env.VITE_USE_DB_JSON) return null;

  const hydrate = async () => {
    const r = await fetch('/db.json');
    const db = (await r.json()) as { user: { id: number; username?: string; auth_token?: string } };
    const t = db.user.auth_token ?? 'fixture';
    useSessionStore.getState().setSession({ id: db.user.id, username: db.user.username ?? 'user' }, t);
    window.location.reload();
  };

  return (
    <div className="fixture-banner">
      Fixture mode (db.json). API calls are mocked for parity tests.
      <button type="button" className="btn-small variant-primary" onClick={hydrate}>
        Load fixture session
      </button>
    </div>
  );
}
