import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDiscoverProjects } from '@/auth/queries';

const ORDERS: Array<{ key: string; label: string }> = [
  { key: 'total_fans_last_week', label: 'This week' },
  { key: 'total_fans_last_month', label: 'This month' },
  { key: 'total_fans', label: 'All time' },
];

export default function Discover() {
  const [order, setOrder] = useState<string>(ORDERS[0].key);
  const { data: projects, isPending } = useDiscoverProjects({ order_by: order });

  return (
    <main className="page" data-testid="discover">
      <h1>Discover</h1>
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }} role="tablist">
        {ORDERS.map((o) => (
          <button
            key={o.key}
            type="button"
            className={'btn btn-secondary' + (o.key === order ? ' active' : '')}
            aria-pressed={o.key === order}
            onClick={() => setOrder(o.key)}
            data-testid={`discover-order-${o.key}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {isPending && <p className="muted">Loading…</p>}
      {projects && projects.length === 0 && <div className="empty">No projects to discover yet.</div>}
      {projects && (
        <ul className="list card" data-testid="discover-list">
          {projects.map((p) => (
            <li key={p.id}>
              <div style={{ flex: 1 }}>
                <Link to={`/project/${p.slug}/timeline`} className="subject-link">
                  {p.name}
                </Link>
                {p.description && <div className="muted">{p.description}</div>}
              </div>
              <div className="muted">{p.total_fans ?? 0} fans</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
