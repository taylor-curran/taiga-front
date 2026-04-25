import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { epics as epicsApi } from '../api/resources';
import type { Project, Epic, Status } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

export default function EpicsDashboardPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: epicsList, isLoading } = useQuery({
    queryKey: ['epics', project.id, filterStatus],
    queryFn: async () => {
      const params: Record<string, unknown> = { project: project.id, order_by: 'epics_order' };
      if (filterStatus) params.status = filterStatus;
      const res = await epicsApi.list(params);
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="epics-page">
      <div className="epics-header">
        <h1>Epics</h1>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {project.epic_statuses.map((s: Status) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="epics-list">
        {epicsList?.map((epic: Epic) => {
          const st = project.epic_statuses.find((s: Status) => s.id === epic.status);
          return (
            <div key={epic.id} className="epic-row">
              <div className="epic-color-bar" style={{ backgroundColor: epic.color }} />
              <div className="epic-info">
                <Link to={`/project/${project.slug}/epic/${epic.ref}`} className="epic-link">
                  #{epic.ref} {epic.subject}
                </Link>
                <span className="status-badge" style={{ borderColor: st?.color }}>{st?.name}</span>
              </div>
              <div className="epic-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: epic.user_stories_counts.total > 0
                        ? `${(epic.user_stories_counts.progress / epic.user_stories_counts.total) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <span>{epic.user_stories_counts.progress}/{epic.user_stories_counts.total} US</span>
              </div>
              <div className="epic-assigned">
                {epic.assigned_to_extra_info?.full_name_display || 'Unassigned'}
              </div>
            </div>
          );
        })}
        {(!epicsList || epicsList.length === 0) && (
          <div className="empty-state"><p>No epics</p></div>
        )}
      </div>
    </div>
  );
}
