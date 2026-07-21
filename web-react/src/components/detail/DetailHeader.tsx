import type { Status } from '../../types';

interface Props {
  refNum: number;
  subject: string;
  statusInfo?: Status;
  assigned?: string;
  isClosed?: boolean;
  isBlocked?: boolean;
  type?: string;
}

export default function DetailHeader({ refNum, subject, statusInfo, assigned, isClosed, isBlocked, type }: Props) {
  return (
    <div className="detail-header">
      <div className="detail-header-top">
        <span className="detail-ref">#{refNum}</span>
        {type && <span className="detail-type-badge">{type}</span>}
        {isBlocked && <span className="badge badge-blocked">Blocked</span>}
        {isClosed && <span className="badge badge-closed">Closed</span>}
      </div>
      <h1 className="detail-subject">{subject}</h1>
      <div className="detail-header-meta">
        {statusInfo && (
          <span className="status-badge" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
            {statusInfo.name}
          </span>
        )}
        <span className="detail-assigned">{assigned || 'Unassigned'}</span>
      </div>
    </div>
  );
}
