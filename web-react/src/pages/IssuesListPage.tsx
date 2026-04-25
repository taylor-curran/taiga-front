import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
import { issues as issuesApi } from '../api/resources';
import type { Project, Issue, Status } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

export default function IssuesListPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || '');
  const [filterType, setFilterType] = useState<string>(searchParams.get('type') || '');

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

  if (isLoading) return <Loader />;

  const statusLookup = new Map(project.issue_statuses.map((s: Status) => [s.id, s]));
  const typeLookup = new Map(project.issue_types.map((t: Status) => [t.id, t]));

  return (
    <div className="issues-page">
      <div className="issues-header">
        <h1>Issues</h1>
      </div>
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
      <div className="issues-table">
        <div className="issues-row issues-row-header">
          <div className="issue-ref">Ref</div>
          <div className="issue-subject">Subject</div>
          <div className="issue-status">Status</div>
          <div className="issue-type">Type</div>
          <div className="issue-priority">Priority</div>
          <div className="issue-severity">Severity</div>
          <div className="issue-assigned">Assigned to</div>
        </div>
        {issuesList?.map((issue: Issue) => {
          const st = statusLookup.get(issue.status);
          const tp = typeLookup.get(issue.type);
          const pr = project.priorities.find((p: Status) => p.id === issue.priority);
          const sv = project.severities.find((s: Status) => s.id === issue.severity);
          return (
            <div key={issue.id} className="issues-row">
              <div className="issue-ref">
                <Link to={`/project/${project.slug}/issue/${issue.ref}`}>#{issue.ref}</Link>
              </div>
              <div className="issue-subject">
                <Link to={`/project/${project.slug}/issue/${issue.ref}`}>{issue.subject}</Link>
              </div>
              <div className="issue-status">
                <span className="status-badge" style={{ borderColor: st?.color }}>{st?.name}</span>
              </div>
              <div className="issue-type">
                <span style={{ color: tp?.color }}>{tp?.name}</span>
              </div>
              <div className="issue-priority">
                <span style={{ color: pr?.color }}>{pr?.name}</span>
              </div>
              <div className="issue-severity">
                <span style={{ color: sv?.color }}>{sv?.name}</span>
              </div>
              <div className="issue-assigned">
                {issue.assigned_to_extra_info?.full_name_display || 'Unassigned'}
              </div>
            </div>
          );
        })}
        {(!issuesList || issuesList.length === 0) && (
          <div className="empty-state"><p>No issues found</p></div>
        )}
      </div>
    </div>
  );
}
