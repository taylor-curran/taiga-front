import { Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useWikiPages } from '@/services/wiki';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';

export function WikiListPage() {
  const project = useCurrentProject();
  const { data, isLoading, error } = useWikiPages(project.id);
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Wiki pages</h1>
      {!data || data.length === 0 ? (
        <Empty title="No wiki pages yet" />
      ) : (
        <ul className="card divide-y divide-taiga-grey-lighter/40">
          {data.map((page) => (
            <li key={page.id} className="px-4 py-3 hover:bg-taiga-bg/60">
              <Link
                to={`/project/${project.slug}/wiki/${page.slug}`}
                className="font-medium"
              >
                {page.slug}
              </Link>
              {page.modified_date && (
                <span className="ml-3 text-xs text-taiga-grey-light">
                  Updated {new Date(page.modified_date).toLocaleDateString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
