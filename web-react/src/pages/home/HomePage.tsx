import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { fetchWorkInProgress, type DutyItem, type WorkInProgress } from '../../api/home';
import { fetchUserProjectsOrdered } from '../../api/userProjects';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import type { TaigaUser } from '../../api/types';
import { resolveNavUrl } from '../../lib/navUrls';

type Props = { user: TaigaUser };

export function HomePage({ user }: Props) {
  const { t } = useTranslation();
  const config = useTaigaConfig();
  const userId = user.id;

  useDocumentMeta(t('HOME.PAGE_TITLE'), t('HOME.PAGE_DESCRIPTION'));

  const wipQ = useQuery({
    queryKey: ['home-wip', userId],
    queryFn: () => fetchWorkInProgress(config, userId),
    enabled: Number.isFinite(userId),
  });

  const projectsQ = useQuery({
    queryKey: ['home-projects', userId],
    queryFn: () => fetchUserProjectsOrdered(config, userId),
    enabled: Number.isFinite(userId),
  });

  return (
    <div
      className="home-wrapper"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
      }}
    >
      <div className="duty-summary" style={{ flex: '2 1 480px' }}>
        <h1 style={{ marginTop: 0 }}>{t('HOME.DASHBOARD')}</h1>
        {wipQ.isPending && <div className="tg-spin">{t('COMMON.LOADING')}</div>}
        {wipQ.isError && <p>{t('COMMON.GENERIC_ERROR', { error: String(wipQ.error) })}</p>}
        {wipQ.data && (
          <>
            <Section title={t('HOME.WORKING_ON_SECTION')} groups={wipQ.data.assignedTo} t={t} working />
            <Section title={t('HOME.WATCHING_SECTION')} groups={wipQ.data.watching} t={t} working={false} />
          </>
        )}
      </div>
      <aside
        className="project-list"
        style={{ flex: '1 1 260px', background: '#fff', padding: '1rem', borderRadius: 4 }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>{t('PROJECTS.MY_PROJECTS')}</h2>
        {projectsQ.isPending && <div className="tg-spin">{t('COMMON.LOADING')}</div>}
        {projectsQ.data && projectsQ.data.length === 0 && (
          <p dangerouslySetInnerHTML={{ __html: t('HOME.EMPTY_PROJECT_LIST') }} />
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(projectsQ.data ?? []).map((p) => (
            <li key={p.id} style={{ marginBottom: '0.65rem' }}>
              <Link to={`/${resolveNavUrl('project', { project: p.slug })}`}>{p.name}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Section({
  title,
  groups,
  t,
  working,
}: {
  title: string;
  groups: WorkInProgress['assignedTo'];
  t: (k: string, o?: Record<string, string>) => string;
  working: boolean;
}) {
  const keys: (keyof typeof groups)[] = ['userStories', 'tasks', 'issues', 'epics'];
  const hasAny = keys.some((k) => (groups[k]?.length ?? 0) > 0);
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.05rem' }}>{title}</h2>
      {!hasAny ? (
        <p
          dangerouslySetInnerHTML={{
            __html: working ? t('HOME.EMPTY_WORKING_ON') : t('HOME.EMPTY_WATCHING'),
          }}
        />
      ) : (
        keys.map((k) =>
          (groups[k] ?? []).length ? <DutyList key={k} label={String(k)} items={groups[k]!} /> : null,
        )
      )}
    </section>
  );
}

function DutyList({ label, items }: { label: string; items: DutyItem[] }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <strong style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{label}</strong>
      <ul style={{ paddingLeft: '1.1rem', margin: '0.35rem 0' }}>
        {items.map((d) => (
          <li key={`${label}-${d.id}`}>
            {d.url ? (
              <Link to={`/${d.url}`}>
                #{d.ref} {d.subject || ''}
              </Link>
            ) : (
              <span>
                #{d.ref} {d.subject || ''}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
