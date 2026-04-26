import { en } from '@/i18n/en';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  getProjectsSlightByMember,
  projectLogoUrl,
  type DashboardDuty,
  dutyTypeLabel,
  loadWorkInProgress,
  userAvatarUrl,
} from '@/api/homeDashboard';
import { getCurrentUser } from '@/api/user';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Link } from 'react-router';
import { dutyDetailHref } from './dutyUrl';
import './listing.css';

function DutyRow({ duty, mode }: { duty: DashboardDuty; mode: 'working-on' | 'watching' }) {
  const type = dutyTypeLabel(duty._name);
  const assignee = duty.assigned_to_extra_info;
  const leftImg =
    mode === 'watching' && assignee
      ? userAvatarUrl({ id: assignee.id, email: assignee.email, photo: assignee.photo, gravatar_id: assignee.gravatar_id })
      : projectLogoUrl(duty.projectInfo);
  const fallback = mode === 'watching' && !assignee ? '/media/unnamed.png' : projectLogoUrl(duty.projectInfo);

  return (
    <Link className={`tg-ticket tg-ticket--${mode === 'watching' ? 'watch' : 'working'}`} to={dutyDetailHref(duty)}>
      <div className="tg-ticket__avatar">
        <img src={leftImg} alt="" onError={(e) => ((e.currentTarget as HTMLImageElement).src = fallback)} />
      </div>
      <div className="tg-ticket__body">
        <div className="tg-ticket__meta">
          <span className="tg-ticket__project">{duty.projectInfo.name}</span>
          <span className="tg-ticket__type">{type}</span>
          {duty.status_extra_info?.name ? (
            <span className="tg-ticket__status" style={{ color: duty.status_extra_info.color || undefined }}>
              {duty.status_extra_info.name}
            </span>
          ) : null}
        </div>
        <div className="tg-ticket__title-row">
          <span className="tg-ticket__ref">#{duty.ref}</span>
          <span className="tg-ticket__subject">{duty.subject}</span>
        </div>
      </div>
    </Link>
  );
}

function Section({
  title,
  duties,
  emptyHtml,
  mode,
}: {
  title: string;
  duties: DashboardDuty[];
  emptyHtml: string;
  mode: 'working-on' | 'watching';
}) {
  return (
    <section className={mode === 'working-on' ? 'tg-working-on' : 'tg-watching'}>
      <h2>{title}</h2>
      {duties.length > 0 ? (
        <div className="tg-ticket-list">
          {duties.map((d) => (
            <DutyRow key={`${d._name}-${d.id}`} duty={d} mode={mode} />
          ))}
        </div>
      ) : (
        <p className="tg-empty-duties" dangerouslySetInnerHTML={{ __html: emptyHtml }} />
      )}
      <p className="tg-hidden-hint">{en.home.noHiddenItems}</p>
    </section>
  );
}

function RecentProjects({ projects }: { projects: { id: number; name: string; slug: string; description?: string | null }[] }) {
  if (projects.length === 0) {
    return (
      <section className="tg-home-projects" data-testid="home-recent-empty">
        <div className="tg-empty-projects">
          <p>{en.projects.emptyList}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="tg-home-projects" data-testid="home-recent-projects">
      <div className="tg-project-cards">
        {projects.map((p) => (
          <Link key={p.id} to={`/project/${p.slug}/timeline`} className="tg-project-card">
            <div className="tg-project-card__head">
              <img className="tg-project-card__logo" src={projectLogoUrl(p)} alt="" />
              <h3 className="tg-project-card__name">{p.name}</h3>
            </div>
            {p.description ? (
              <p className="tg-project-card__desc">
                {p.description.length > 100 ? `${p.description.slice(0, 100)}…` : p.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
      <Link to="/projects" className="tg-link-manage" data-testid="see-more-projects">
        {en.projects.manageList}
      </Link>
    </section>
  );
}

export default function HomeDashboardPage() {
  const { data, error, loading } = useAsyncResource('home', async () => {
    const user = await getCurrentUser();
    const [projects, wip] = await Promise.all([getProjectsSlightByMember(user.id), loadWorkInProgress(user.id)]);
    return { user, projects, wip };
  });

  if (loading) {
    return <LoadingScreen />;
  }
  if (error || !data) {
    return (
      <div className="tg-center">
        <p className="tg-listing-error" data-testid="home-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="tg-center tg-home-wrapper" data-testid="home-dashboard">
      <div className="tg-duty-summary">
        <h1>{en.home.dashboard}</h1>
        <Section title={en.home.workingOn} duties={data.wip.assignedTo} emptyHtml={en.home.emptyWorkingOn} mode="working-on" />
        <Section title={en.home.watching} duties={data.wip.watching} emptyHtml={en.home.emptyWatching} mode="watching" />
      </div>
      <RecentProjects projects={data.projects} />
    </div>
  );
}
