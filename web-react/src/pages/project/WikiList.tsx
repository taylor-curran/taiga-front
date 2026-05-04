import { Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useWikiPages } from '@/services/wiki';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { WikiNav } from '@/components/wiki';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WikiListPage() {
  const project = useCurrentProject();
  const { data, isLoading, error } = useWikiPages(project.id);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Sidebar */}
      <aside className="col-span-12 lg:col-span-3">
        <div className="card p-3 sticky top-4">
          <WikiNav />
        </div>
      </aside>

      {/* Main content */}
      <div className="col-span-12 lg:col-span-9 space-y-4">
        <header className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">Wiki</h1>
          <span className="text-sm text-taiga-grey-light">Pages list</span>
        </header>

        {!data || data.length === 0 ? (
          <Empty title="No wiki pages yet" message="Create your first wiki page to get started." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-taiga-bg text-xs text-taiga-grey uppercase">
                  <th className="text-left px-4 py-2 font-semibold">Title</th>
                  <th className="text-left px-4 py-2 font-semibold">Editions</th>
                  <th className="text-left px-4 py-2 font-semibold">Created</th>
                  <th className="text-left px-4 py-2 font-semibold">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taiga-grey-lighter/40">
                {data.map((page) => (
                  <tr key={page.id} className="hover:bg-taiga-bg/60">
                    <td className="px-4 py-3">
                      <Link
                        to={`/project/${project.slug}/wiki/${page.slug}`}
                        className="font-medium"
                      >
                        {page.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-taiga-grey">
                      {page.editions ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-taiga-grey-light text-xs">
                      {formatDate(page.created_date)}
                    </td>
                    <td className="px-4 py-3 text-taiga-grey-light text-xs">
                      {formatDate(page.modified_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
