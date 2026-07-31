import { Navigate } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useWikiPages } from '@/services/wiki';
import { Loading } from '@/components/common/Loading';

export function WikiPage() {
  const project = useCurrentProject();
  const { data, isLoading } = useWikiPages(project.id);
  if (isLoading) return <Loading />;
  const home = data?.find((p) => p.slug === 'home') ?? data?.[0];
  if (!home) {
    return (
      <Navigate to={`/project/${project.slug}/wiki-list`} replace />
    );
  }
  return <Navigate to={`/project/${project.slug}/wiki/${home.slug}`} replace />;
}
