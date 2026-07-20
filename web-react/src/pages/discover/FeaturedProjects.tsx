import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { listProjects } from '../../api/projects';
import { resolveNavUrl } from '../../lib/navUrls';
import type { ProjectSummary } from '../../api/types';

export function FeaturedProjects() {
  const { t } = useTranslation();
  const config = useTaigaConfig();
  const q = useQuery({
    queryKey: ['discover-featured'],
    queryFn: async () => {
      const { projects } = await listProjects(config, { discover_mode: true, is_featured: true });
      return projects.slice(0, 4);
    },
  });

  if (q.isPending) return <div className="tg-spin">{t('COMMON.LOADING')}</div>;
  if (q.isError) return null;

  return (
    <section className="discover-highlight">
      <h3>{t('DISCOVER.FEATURED')}</h3>
      <div className="discover-highlight-grid">
        {(q.data ?? []).map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  const href = `/${resolveNavUrl('project', { project: project.slug })}`;
  const desc = (project.description || '').slice(0, 200);
  return (
    <article className="discover-project-card">
      <Link to={href}>
        <p className="name">{project.name}</p>
      </Link>
      {desc && <p className="desc">{desc}{project.description && project.description.length > 200 ? '…' : ''}</p>}
    </article>
  );
}
