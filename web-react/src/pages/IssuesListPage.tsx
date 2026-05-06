import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
import { issues as issuesApi } from '../api/resources';
import type { Project, Issue, Status } from '../types';
import Loader from '../components/common/Loader';
import { useState, useMemo } from 'react';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function IssuesListPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || '');
  const [filterType, setFilterType] = useState<string>(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTags, setShowTags] = useState(true);
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: issuesList, isLoading } = useQuery({
    queryKey: ['issues', project.id, filterStatus, filterType],
    queryFn: async () => {
      const params: Record<string, unknown> = { project: project.id, order_by: '-created_date' };
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      const res = await issuesApi.list(params);
      return res.data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setFilterStatus(value);
    if (key === 'type') setFilterType(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const statusLookup = useMemo(
    () => new Map(project.issue_statuses.map((s: Status) => [s.id, s])),
    [project.issue_statuses],
  );
  const typeLookup = useMemo(
    () => new Map(project.issue_types.map((t: Status) => [t.id, t])),
    [project.issue_types],
  );

  const filteredAndSorted = useMemo(() => {
    if (!issuesList) return [];
    let result = [...issuesList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i: Issue) =>
        i.subject.toLowerCase().includes(q) || String(i.ref).includes(q),
      );
    }
    if (sortField) {
      result.sort((a: Issue, b: Issue) => {
        let va: string | number = 0;
        let vb: string | number = 0;
        if (sortField === 'status') { va = statusLookup.get(a.status)?.name || ''; vb = statusLookup.get(b.status)?.name || ''; }
        else if (sortField === 'type') { va = typeLookup.get(a.type)?.name || ''; vb = typeLookup.get(b.type)?.name || ''; }
        else if (sortField === 'modified') { va = a.modified_date; vb = b.modified_date; }
        else if (sortField === 'ref') { va = a.ref; vb = b.ref; }
        else if (sortField === 'subject') { va = a.subject.toLowerCase(); vb = b.subject.toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [issuesList, searchQuery, sortField, sortDir, statusLookup, typeLookup]);

  if (isLoading) return <Loader />;

  const sortIcon = (field: string) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅';

  return (
    <div className="issues-page">
      <div className="issues-header">
        <h1>Issues</h1>
      </div>
      <div className="issues-toolbar">
        <div className="issues-filters">
          <select value={filterStatus} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="">All statuses</option>
            {project.issue_statuses.map((s: Status) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={filterType} onChange={(e) => handleFilterChange('type', e.target.value)}>
            <option value="">All types</option>
            {project.issue_types.map((t: Status) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="issues-toolbar-right">
          <div className="search-input">
            <input
              type="search"
              placeholder="subject or reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="toggle-label">
            <input type="checkbox" checked={showTags} onChange={() => setShowTags(!showTags)} />
            Tags
          </label>
        </div>
      </div>
      <div className="issues-table">
        <div className="issues-row issues-row-header">
          <div className="issue-type-icon" onClick={() => handleSort('type')}>Type{sortIcon('type')}</div>
          <div className="issue-severity-icon">Sev</div>
          <div className="issue-priority-icon">Pri</div>
          <div className="issue-subject" onClick={() => handleSort('subject')}>Issue{sortIcon('subject')}</div>
          <div className="issue-status" onClick={() => handleSort('status')}>Status{sortIcon('status')}</div>
          <div className="issue-modified" onClick={() => handleSort('modified')}>Modified{sortIcon('modified')}</div>
          <div className="issue-assigned">Assign to</div>
        </div>
        {filteredAndSorted.map((issue: Issue) => {
          const st = statusLookup.get(issue.status);
          const tp = typeLookup.get(issue.type);
          const pr = project.priorities.find((p: Status) => p.id === issue.priority);
          const sv = project.severities.find((s: Status) => s.id === issue.severity);
          return (
            <div key={issue.id} className="issues-row">
              <div className="issue-type-icon">
                <span className="color-dot" style={{ backgroundColor: tp?.color || '#ccc' }} title={tp?.name} />
              </div>
              <div className="issue-severity-icon">
                <span className="color-dot" style={{ backgroundColor: sv?.color || '#ccc' }} title={sv?.name} />
              </div>
              <div className="issue-priority-icon">
                <span className="color-dot" style={{ backgroundColor: pr?.color || '#ccc' }} title={pr?.name} />
              </div>
              <div className="issue-subject">
                <Link to={`/project/${project.slug}/issue/${issue.ref}`}>
                  <span className="issue-ref">#{issue.ref}</span> {issue.subject}
                </Link>
                {showTags && issue.tags?.length > 0 && (
                  <div className="inline-tags">
                    {issue.tags.map(([tag, color]) => (
                      <span key={tag} className="tag-badge" style={{ backgroundColor: color || '#E8A4C8' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="issue-status">
                <span className="status-badge" style={{ borderColor: st?.color, color: st?.color }}>{st?.name}</span>
              </div>
              <div className="issue-modified">{formatDate(issue.modified_date)}</div>
              <div className="issue-assigned">
                {issue.assigned_to_extra_info ? (
                  <span className="assigned-avatar" title={issue.assigned_to_extra_info.full_name_display}>
                    <img
                      src={issue.assigned_to_extra_info.photo || `https://www.gravatar.com/avatar/${issue.assigned_to_extra_info.gravatar_id}?s=24&d=mm`}
                      alt=""
                    />
                  </span>
                ) : (
                  <span className="unassigned-avatar" title="Unassigned" />
                )}
              </div>
            </div>
          );
        })}
        {filteredAndSorted.length === 0 && (
          <div className="empty-state"><p>No issues found</p></div>
        )}
      </div>
    </div>
  );
}
