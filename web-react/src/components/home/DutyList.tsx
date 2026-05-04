import { Link } from 'react-router-dom';
import type { DutyItem } from '@/types/api';

const TYPE_LABELS: Record<string, string> = {
  userstory: 'US',
  task: 'Task',
  issue: 'Issue',
  epic: 'Epic',
};

function dutyUrl(duty: DutyItem): string {
  const slug = duty.project_extra_info?.slug ?? '';
  const typeMap: Record<string, string> = {
    userstory: 'us',
    task: 'task',
    issue: 'issue',
    epic: 'epic',
  };
  const segment = typeMap[duty._type] ?? duty._type;
  return `/project/${slug}/${segment}/${duty.ref}`;
}

interface DutyListProps {
  duties: DutyItem[];
  maxItems?: number;
}

export function DutyList({ duties, maxItems }: DutyListProps) {
  const items = maxItems ? duties.slice(0, maxItems) : duties;

  return (
    <div className="space-y-1">
      {items.map((duty) => (
        <Link
          key={`${duty._type}-${duty.id}`}
          to={dutyUrl(duty)}
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-taiga-grey-lighter/30 no-underline hover:no-underline text-taiga-text"
        >
          {/* Project logo */}
          {duty.project_extra_info?.logo_small_url ? (
            <img
              src={duty.project_extra_info.logo_small_url}
              alt=""
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
          ) : (
            <span className="w-8 h-8 rounded bg-taiga-green-dark text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {(duty.project_extra_info?.name ?? '?').slice(0, 2).toUpperCase()}
            </span>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-taiga-grey-light mb-0.5">
              <span className="truncate">{duty.project_extra_info?.name}</span>
              <span className="font-medium">{TYPE_LABELS[duty._type] ?? duty._type}</span>
              {duty.status_extra_info && (
                <span style={{ color: duty.status_extra_info.color ?? undefined }}>
                  {duty.status_extra_info.name}
                </span>
              )}
              {duty.is_blocked && (
                <span className="text-taiga-red font-medium">Blocked</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-taiga-grey-light">#{duty.ref}</span>
              <span className="truncate">{duty.subject}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
