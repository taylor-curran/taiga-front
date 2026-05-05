import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import Loader from '../components/common/Loader';

interface ExternalApp {
  id: number;
  name: string;
  icon_url: string;
  web: string;
  next_url: string;
}

export default function ExternalAppsPage() {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['external-apps'],
    queryFn: async () => {
      const res = await api.get<ExternalApp[]>('/api/v1/applications');
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="external-apps-page">
      <h1>External Applications</h1>
      <div className="apps-list">
        {apps?.map((app) => (
          <div key={app.id} className="app-card">
            {app.icon_url && <img src={app.icon_url} alt={app.name} className="app-icon" />}
            <div className="app-info">
              <h3>{app.name}</h3>
              {app.web && <a href={app.web} target="_blank" rel="noreferrer">{app.web}</a>}
            </div>
          </div>
        ))}
        {(!apps || apps.length === 0) && (
          <div className="empty-state"><p>No external applications configured</p></div>
        )}
      </div>
    </div>
  );
}
