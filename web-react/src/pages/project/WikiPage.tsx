import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { useMemo } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useWikiPageBySlug } from '@/services/wiki';
import { Loading } from '@/components/common/Loading';
import { Empty } from '@/components/common/Empty';
import { sanitizeHtml } from '@/lib/sanitize';

export function WikiPageView() {
  const project = useCurrentProject();
  const { slug } = useParams();
  const { data, isLoading } = useWikiPageBySlug(project.id, slug);

  const html = useMemo(() => {
    if (!data) return '';
    if (data.html) return sanitizeHtml(data.html);
    if (data.content) return sanitizeHtml(marked.parse(data.content) as string);
    return '';
  }, [data]);

  if (isLoading) return <Loading />;
  if (!data) {
    return (
      <Empty
        title="Page not found"
        message={`No wiki page with slug "${slug}" yet.`}
      />
    );
  }
  return (
    <article className="card p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{data.slug}</h1>
        <Link
          to={`/project/${project.slug}/wiki-list`}
          className="text-sm text-taiga-link"
        >
          All pages
        </Link>
      </header>
      <div
        className="prose max-w-none text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
