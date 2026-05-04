import { Link } from 'react-router-dom';
import type { Issue } from '@/types/api';
import { Avatar } from '@/components/common/Avatar';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface IssuesTableProps {
  issues: Issue[];
  projectSlug: string;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  sort: SortConfig;
  onSort: (field: string) => void;
  showTags?: boolean;
}

const COLUMNS: { key: string; label: string; sortField: string; className?: string }[] = [
  { key: 'ref', label: 'ID', sortField: 'ref', className: 'w-16' },
  { key: 'subject', label: 'Subject', sortField: 'subject' },
  { key: 'type', label: 'Type', sortField: 'type', className: 'w-24' },
  { key: 'severity', label: 'Severity', sortField: 'severity', className: 'w-24' },
  { key: 'priority', label: 'Priority', sortField: 'priority', className: 'w-24' },
  { key: 'status', label: 'Status', sortField: 'status', className: 'w-28' },
  { key: 'assigned_to', label: 'Assignee', sortField: 'assigned_to', className: 'w-32' },
];

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) return <span className="text-taiga-grey-lighter ml-0.5">{'\u2195'}</span>;
  return (
    <span className="text-taiga-green-dark ml-0.5">
      {direction === 'asc' ? '\u2191' : '\u2193'}
    </span>
  );
}

function ColorBadge({ name, color }: { name?: string; color?: string }) {
  if (!name) return <span className="text-taiga-grey-light">--</span>;
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium leading-tight truncate max-w-full"
      style={
        color
          ? { backgroundColor: color, color: '#fff' }
          : { backgroundColor: '#e5e7eb', color: '#555' }
      }
    >
      {name}
    </span>
  );
}

export function IssuesTable({
  issues,
  projectSlug,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  sort,
  onSort,
  showTags,
}: IssuesTableProps) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-taiga-grey-lighter/40 text-left text-xs text-taiga-grey-light">
            <th className="px-3 py-2 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="accent-taiga-green-dark"
              />
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 cursor-pointer select-none hover:text-taiga-text ${col.className || ''}`}
                onClick={() => onSort(col.sortField)}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  <SortIcon
                    active={sort.field === col.sortField}
                    direction={sort.direction}
                  />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className={`border-b border-taiga-grey-lighter/20 hover:bg-taiga-bg/60 ${
                selectedIds.has(issue.id) ? 'bg-taiga-green/10' : ''
              } ${issue.is_closed ? 'opacity-60' : ''}`}
            >
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(issue.id)}
                  onChange={() => onToggleSelect(issue.id)}
                  className="accent-taiga-green-dark"
                />
              </td>
              <td className="px-3 py-2 font-mono text-xs text-taiga-grey-light">
                #{issue.ref}
              </td>
              <td className="px-3 py-2">
                <Link
                  to={`/project/${projectSlug}/issue/${issue.ref}`}
                  className="font-medium text-taiga-text hover:text-taiga-link"
                >
                  {issue.subject}
                </Link>
                {showTags && issue.tags && issue.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {issue.tags.map((tag, i) => {
                      const [name, color] = Array.isArray(tag) ? tag : [tag, null];
                      return (
                        <span
                          key={`${name}-${i}`}
                          className="text-[10px] px-1 rounded"
                          style={{
                            backgroundColor: color ? `${color}33` : '#e5e7eb',
                            color: color || '#666',
                          }}
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </td>
              <td className="px-3 py-2">
                <ColorBadge
                  name={issue.type_extra_info?.name}
                  color={issue.type_extra_info?.color}
                />
              </td>
              <td className="px-3 py-2">
                <ColorBadge
                  name={issue.severity_extra_info?.name}
                  color={issue.severity_extra_info?.color}
                />
              </td>
              <td className="px-3 py-2">
                <ColorBadge
                  name={issue.priority_extra_info?.name}
                  color={issue.priority_extra_info?.color}
                />
              </td>
              <td className="px-3 py-2">
                <ColorBadge
                  name={issue.status_extra_info?.name}
                  color={issue.status_extra_info?.color}
                />
              </td>
              <td className="px-3 py-2">
                {issue.assigned_to_extra_info?.full_name_display ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar
                      name={issue.assigned_to_extra_info.full_name_display}
                      src={issue.assigned_to_extra_info.photo}
                      size={20}
                    />
                    <span className="text-xs truncate max-w-[100px]">
                      {issue.assigned_to_extra_info.full_name_display}
                    </span>
                  </div>
                ) : (
                  <span className="text-taiga-grey-light text-xs">Unassigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
