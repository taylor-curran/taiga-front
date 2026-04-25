import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { wiki as wikiApi } from '../api/resources';
import type { Project, WikiPage } from '../types';
import Loader from '../components/common/Loader';

export default function WikiListPage() {
  const { project } = useOutletContext<{ project: Project }>();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['wiki-all', project.id],
    queryFn: async () => {
      const res = await wikiApi.list(project.id);
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="wiki-list-page">
      <h1>All Wiki Pages</h1>
      <div className="wiki-list">
        {pages?.map((page: WikiPage) => (
          <div key={page.id} className="wiki-list-item">
            <Link to={`/project/${project.slug}/wiki/${page.slug}`}>
              {page.slug}
            </Link>
            <span className="wiki-list-date">
              Modified: {new Date(page.modified_date).toLocaleDateString()}
            </span>
            <span className="wiki-list-editions">{page.editions} editions</span>
          </div>
        ))}
        {(!pages || pages.length === 0) && (
          <div className="empty-state"><p>No wiki pages</p></div>
        )}
      </div>
    </div>
  );
}
