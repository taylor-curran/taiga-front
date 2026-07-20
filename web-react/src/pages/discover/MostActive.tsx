import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { listProjects } from '../../api/projects';
import { resolveNavUrl } from '../../lib/navUrls';
import type { ProjectSummary } from '../../api/types';

function orderParam(period: string): string {
  if (period === 'all') return '-total_activity';
  return `-total_activity_last_${period}`;
}

export function MostActive() {
  const { t } = useTranslation();
  const config = useTaigaConfig();
  const [period, setPeriod] = useState('year');

  const q = useQuery({
    queryKey: ['discover-most-active', period],
    queryFn: async () => {
      const { projects } = await listProjects(config, {
        discover_mode: true,
        order_by: orderParam(period),
      });
      return projects.slice(0, 4);
    },
  });

  return (
    <section className="discover-highlight">
      <h3>{t('DISCOVER.MOST_ACTIVE')}</h3>
      <PeriodPicker value={period} onChange={setPeriod} />
      {q.isPending ? (
        <div className="tg-spin">{t('COMMON.LOADING')}</div>
      ) : (
        <div className="discover-highlight-grid">
          {(q.data ?? []).length === 0 ? (
            <p>{t('DISCOVER.MOST_ACTIVE_EMPTY')}</p>
          ) : (
            (q.data ?? []).map((p) => <MiniCard key={p.id} project={p} />)
          )}
        </div>
      )}
    </section>
  );
}

function PeriodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const opts = [
    { id: 'week', key: 'DISCOVER.FILTERS.WEEK' },
    { id: 'month', key: 'DISCOVER.FILTERS.MONTH' },
    { id: 'year', key: 'DISCOVER.FILTERS.YEAR' },
    { id: 'all', key: 'DISCOVER.FILTERS.ALL_TIME' },
  ] as const;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          className="btn-small"
          style={{
            marginRight: '0.35rem',
            background: value === o.id ? '#008aa8' : '#25a28c',
            opacity: value === o.id ? 1 : 0.75,
          }}
          onClick={() => onChange(o.id)}
        >
          {t(o.key)}
        </button>
      ))}
    </div>
  );
}

function MiniCard({ project }: { project: ProjectSummary }) {
  const href = `/${resolveNavUrl('project', { project: project.slug })}`;
  return (
    <article className="discover-project-card">
      <Link to={href}>
        <p className="name">{project.name}</p>
      </Link>
    </article>
  );
}
