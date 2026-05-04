import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  useUserBySlug,
  useUserContacts,
  useUserTimeline,
  useProjectsByUser,
  useLiked,
  useVoted,
  useWatched,
} from '@/services/users';
import { Avatar } from '@/components/common/Avatar';
import { Loading } from '@/components/common/Loading';
import { Empty } from '@/components/common/Empty';
import { formatDistanceToNow } from 'date-fns';
import type { Contact, ProjectSummary, TimelineEntry, LikedItem, VotedItem, WatchedItem } from '@/types/api';

type ProfileTab = 'timeline' | 'projects' | 'contacts' | 'liked' | 'voted' | 'watched';

export function ProfilePage() {
  const { slug } = useParams();
  const me = useAuth((s) => s.user);
  const { data: fetchedUser, isLoading: userLoading } = useUserBySlug(slug);

  const user = slug ? fetchedUser ?? null : me;
  const isCurrentUser = !slug || (me !== null && user !== null && me.id === user?.id);

  const [activeTab, setActiveTab] = useState<ProfileTab>('timeline');

  if (userLoading && slug) return <Loading />;
  if (!user) return <Empty title="User not found" />;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3">
        <div className="card p-6 space-y-4">
          <div className="flex flex-col items-center text-center">
            <Avatar
              name={user.full_name_display || user.full_name || user.username}
              src={user.big_photo || user.photo}
              size={96}
            />
            <h1 className="mt-3 text-xl font-semibold">
              {user.full_name_display || user.full_name || user.username}
            </h1>
            <p className="text-sm text-taiga-grey-light">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-sm text-taiga-grey">
              {user.bio}
            </p>
          )}

          <dl className="text-sm space-y-2">
            {user.email && (
              <div>
                <dt className="text-taiga-grey-light text-xs uppercase tracking-wide">Email</dt>
                <dd>{user.email}</dd>
              </div>
            )}
            <div className="flex gap-4">
              <div>
                <dt className="text-taiga-grey-light text-xs uppercase tracking-wide">Public projects</dt>
                <dd className="font-medium">{user.total_public_projects ?? 0}</dd>
              </div>
              <div>
                <dt className="text-taiga-grey-light text-xs uppercase tracking-wide">Private projects</dt>
                <dd className="font-medium">{user.total_private_projects ?? 0}</dd>
              </div>
            </div>
            {user.lang && (
              <div>
                <dt className="text-taiga-grey-light text-xs uppercase tracking-wide">Language</dt>
                <dd>{user.lang}</dd>
              </div>
            )}
          </dl>

          {isCurrentUser && (
            <Link
              to="/user-settings/user-profile"
              className="btn-primary w-full text-center text-sm block"
            >
              Edit profile
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <section className="col-span-12 md:col-span-9 space-y-4">
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'timeline' && <TimelineSection userId={user.id} />}
        {activeTab === 'projects' && <ProjectsSection userId={user.id} />}
        {activeTab === 'contacts' && <ContactsSection userId={user.id} isCurrentUser={isCurrentUser} />}
        {activeTab === 'liked' && <LikedSection userId={user.id} />}
        {activeTab === 'voted' && <VotedSection userId={user.id} />}
        {activeTab === 'watched' && <WatchedSection userId={user.id} />}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const TABS: { key: ProfileTab; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'projects', label: 'Projects' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'liked', label: 'Liked' },
  { key: 'voted', label: 'Voted' },
  { key: 'watched', label: 'Watched' },
];

function ProfileTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: ProfileTab;
  setActiveTab: (t: ProfileTab) => void;
}) {
  return (
    <nav className="flex gap-1 border-b border-taiga-grey-lighter pb-0">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === tab.key
              ? 'border-taiga-green-dark text-taiga-green-dark'
              : 'border-transparent text-taiga-grey-light hover:text-taiga-grey'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline                                                           */
/* ------------------------------------------------------------------ */

function describeEvent(entry: TimelineEntry): string {
  const eventType = entry.event_type || '';
  const data = entry.data || {};
  const parts = eventType.split('.');
  const verb = parts[parts.length - 1] || 'activity';
  const subject =
    (data.userstory as { subject?: string })?.subject ||
    (data.task as { subject?: string })?.subject ||
    (data.issue as { subject?: string })?.subject ||
    (data.project as { name?: string })?.name ||
    (data.milestone as { name?: string })?.name ||
    '';
  const pretty = verb.replace(/_/g, ' ');
  return subject ? `${pretty}: ${subject}` : pretty;
}

function TimelineSection({ userId }: { userId: number }) {
  const { data, isLoading } = useUserTimeline(userId);

  if (isLoading) return <Loading />;
  if (!data || data.length === 0) return <Empty title="No activity yet" />;

  return (
    <ul className="card divide-y divide-taiga-grey-lighter/40">
      {data.slice(0, 50).map((entry) => (
        <li key={entry.id} className="px-4 py-3">
          <p className="text-sm">{describeEvent(entry)}</p>
          <p className="text-xs text-taiga-grey-light mt-1">
            {formatDistanceToNow(new Date(entry.created))} ago
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

function ProjectsSection({ userId }: { userId: number }) {
  const { data, isLoading } = useProjectsByUser(userId);

  if (isLoading) return <Loading />;
  if (!data || data.length === 0) return <Empty title="No projects" />;

  return (
    <div className="space-y-3">
      {data.map((project: ProjectSummary) => (
        <Link
          key={project.id}
          to={`/project/${project.slug}`}
          className="card p-4 flex items-center gap-4 hover:bg-taiga-grey-lighter/20 transition-colors no-underline"
        >
          {project.logo_small_url ? (
            <img src={project.logo_small_url} alt="" className="w-10 h-10 rounded" />
          ) : (
            <span className="w-10 h-10 rounded bg-taiga-green-dark/20 flex items-center justify-center text-taiga-green-dark font-bold text-lg">
              {project.name[0]?.toUpperCase()}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-taiga-grey-light mt-0.5 truncate">
                {project.description.slice(0, 200)}
              </p>
            )}
          </div>
          <div className="flex gap-3 text-xs text-taiga-grey-light">
            {project.is_private !== undefined && (
              <span>{project.is_private ? 'Private' : 'Public'}</span>
            )}
            {typeof project.total_fans === 'number' && (
              <span title="Likes">{project.total_fans} likes</span>
            )}
            {typeof project.total_watchers === 'number' && (
              <span title="Watchers">{project.total_watchers} watchers</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contacts                                                           */
/* ------------------------------------------------------------------ */

function ContactsSection({
  userId,
  isCurrentUser,
}: {
  userId: number;
  isCurrentUser: boolean;
}) {
  const { data, isLoading } = useUserContacts(userId);

  if (isLoading) return <Loading />;
  if (!data || data.length === 0) {
    return (
      <Empty
        title={
          isCurrentUser
            ? 'You have no contacts yet'
            : 'No contacts'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {data.map((contact: Contact) => (
        <Link
          key={contact.id}
          to={`/profile/${contact.username}`}
          className="card p-4 flex items-center gap-3 hover:bg-taiga-grey-lighter/20 transition-colors no-underline"
        >
          <Avatar
            name={contact.full_name_display || contact.full_name || contact.username}
            src={contact.photo}
            size={40}
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {contact.full_name_display || contact.full_name || contact.username}
            </p>
            {contact.roles && contact.roles.length > 0 && (
              <p className="text-xs text-taiga-grey-light truncate">
                {contact.roles.join(', ')}
              </p>
            )}
            {contact.bio && (
              <p className="text-xs text-taiga-grey-light mt-0.5 truncate">
                {contact.bio}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Liked                                                              */
/* ------------------------------------------------------------------ */

function LikedSection({ userId }: { userId: number }) {
  const { data, isLoading } = useLiked(userId);

  if (isLoading) return <Loading />;
  if (!data || data.length === 0) return <Empty title="No liked items" />;

  return (
    <ul className="card divide-y divide-taiga-grey-lighter/40">
      {data.map((item: LikedItem) => (
        <FavItem
          key={`${item.type}-${item.id}`}
          type={item.type}
          name={item.name || item.subject || `#${item.ref}`}
          description={item.description}
          projectName={item.project?.name}
          projectSlug={item.project?.slug}
          ref_={item.ref}
          slug={item.slug}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Voted                                                              */
/* ------------------------------------------------------------------ */

function VotedSection({ userId }: { userId: number }) {
  const { data, isLoading } = useVoted(userId);

  if (isLoading) return <Loading />;
  if (!data || data.length === 0) return <Empty title="No voted items" />;

  return (
    <ul className="card divide-y divide-taiga-grey-lighter/40">
      {data.map((item: VotedItem) => (
        <FavItem
          key={`${item.type}-${item.id}`}
          type={item.type}
          name={item.name || item.subject || `#${item.ref}`}
          description={item.description}
          projectName={item.project?.name}
          projectSlug={item.project?.slug}
          ref_={item.ref}
          slug={item.slug}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Watched                                                            */
/* ------------------------------------------------------------------ */

function WatchedSection({ userId }: { userId: number }) {
  const { data, isLoading } = useWatched(userId);

  if (isLoading) return <Loading />;
  if (!data || data.length === 0) return <Empty title="No watched items" />;

  return (
    <ul className="card divide-y divide-taiga-grey-lighter/40">
      {data.map((item: WatchedItem) => (
        <FavItem
          key={`${item.type}-${item.id}`}
          type={item.type}
          name={item.name || item.subject || `#${item.ref}`}
          description={item.description}
          projectName={item.project?.name}
          projectSlug={item.project?.slug}
          ref_={item.ref}
          slug={item.slug}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared fav item renderer                                           */
/* ------------------------------------------------------------------ */

function FavItem({
  type,
  name,
  description,
  projectName,
  projectSlug,
  ref_,
  slug,
}: {
  type: string;
  name?: string;
  description?: string;
  projectName?: string;
  projectSlug?: string;
  ref_?: number;
  slug?: string;
}) {
  const typeBadgeColors: Record<string, string> = {
    project: 'bg-taiga-green-dark/10 text-taiga-green-dark',
    epic: 'bg-purple-100 text-purple-700',
    userstory: 'bg-blue-100 text-blue-700',
    task: 'bg-amber-100 text-amber-700',
    issue: 'bg-red-100 text-red-700',
  };

  let href: string | undefined;
  if (type === 'project' && slug) {
    href = `/project/${slug}`;
  } else if (projectSlug && ref_) {
    const prefix = type === 'userstory' ? 'us' : type === 'task' ? 'task' : type === 'issue' ? 'issue' : type;
    href = `/project/${projectSlug}/${prefix}/${ref_}`;
  }

  return (
    <li className="px-4 py-3 flex items-start gap-3">
      <span
        className={`text-xs px-2 py-0.5 rounded font-medium ${typeBadgeColors[type] || 'bg-gray-100 text-gray-600'}`}
      >
        {type}
      </span>
      <div className="flex-1 min-w-0">
        {href ? (
          <Link to={href} className="font-medium text-sm hover:underline">
            {name}
          </Link>
        ) : (
          <span className="font-medium text-sm">{name}</span>
        )}
        {projectName && type !== 'project' && (
          <span className="text-xs text-taiga-grey-light ml-2">in {projectName}</span>
        )}
        {description && (
          <p className="text-xs text-taiga-grey-light mt-0.5 truncate">{description.slice(0, 200)}</p>
        )}
      </div>
    </li>
  );
}
