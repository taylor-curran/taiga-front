import { Link } from 'react-router-dom';
import type { TimelineEntry } from '../api/resources';
import { Avatar } from './Avatar';
import { formatRelative } from '../utils/dates';

function describe(entry: TimelineEntry): { actor: string; verb: string; target: string; href?: string } {
  const data = (entry.data || {}) as Record<string, any>;
  const eventParts = entry.event_type.split('.');
  const obj = eventParts[0];
  const action = eventParts[2] || eventParts[1] || 'changed';
  const actor =
    data.user?.name ||
    data.user?.username ||
    data.user?.full_name ||
    'Someone';
  const projectSlug: string | undefined = data.project?.slug;
  const objId = data[obj]?.ref;
  const subject = data[obj]?.subject || data[obj]?.name || data.project?.name || '';
  let href: string | undefined;
  if (projectSlug && objId) {
    if (obj === 'userstory') href = `/project/${projectSlug}/us/${objId}`;
    else if (obj === 'task') href = `/project/${projectSlug}/task/${objId}`;
    else if (obj === 'issue') href = `/project/${projectSlug}/issue/${objId}`;
    else if (obj === 'epic') href = `/project/${projectSlug}/epic/${objId}`;
  } else if (projectSlug) {
    href = `/project/${projectSlug}/`;
  }
  return { actor, verb: `${action} ${obj}`, target: subject, href };
}

export function TimelineFeed({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ul className="space-y-3" data-testid="timeline-feed">
      {entries.map((e) => {
        const d = describe(e);
        const data = (e.data || {}) as Record<string, any>;
        return (
          <li key={e.id} className="flex gap-3 rounded border border-slate-100 bg-slate-50 p-3 text-sm">
            <Avatar user={{ full_name: d.actor, photo: data.user?.photo, username: data.user?.username }} size={32} />
            <div className="min-w-0 flex-1">
              <div className="text-slate-700">
                <strong>{d.actor}</strong> <span className="text-slate-500">{d.verb}</span>{' '}
                {d.href ? (
                  <Link to={d.href} className="font-semibold text-taiga-700 hover:underline">{d.target}</Link>
                ) : (
                  <span className="font-semibold">{d.target}</span>
                )}
              </div>
              <div className="text-xs text-slate-400">{formatRelative(e.created)}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
