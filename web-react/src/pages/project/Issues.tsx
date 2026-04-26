import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useIssues } from '@/projects/queries';
import { StatusPill } from '@/components/StatusPill';
import type { ProjectDetail } from '@/api/types';

export default function Issues() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const [showClosed, setShowClosed] = useState(false);
  const { data: issues } = useIssues(project.id);

  const filtered = (issues ?? []).filter((i) => (showClosed ? true : !i.is_closed));

  return (
    <div data-testid="issues">
      <h1>Issues</h1>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem' }}>
        <label style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center', fontWeight: 400, margin: 0 }}>
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
            style={{ width: 'auto' }}
            data-testid="issues-show-closed"
          />
          Show closed
        </label>
        <span className="muted">
          {filtered.length} of {issues?.length ?? 0}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="empty">No issues.</div>
      ) : (
        <table className="tg-table" data-testid="issues-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Ref</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const sev = project.severities?.find((s) => s.id === i.severity);
              const typ = project.issue_types?.find((s) => s.id === i.type);
              return (
                <tr key={i.id} data-testid={`issue-row-${i.ref}`}>
                  <td className="muted">#{i.ref}</td>
                  <td>
                    <Link to={`/project/${project.slug}/issue/${i.ref}`} className="subject-link">
                      {i.subject}
                    </Link>
                  </td>
                  <td>
                    <StatusPill name={i.status_extra_info.name} color={i.status_extra_info.color} />
                  </td>
                  <td>{sev ? <StatusPill name={sev.name} color={sev.color} /> : ''}</td>
                  <td>{typ ? <StatusPill name={typ.name} color={typ.color} /> : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
