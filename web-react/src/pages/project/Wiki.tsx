import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ProjectDetail } from '@/api/types';

interface WikiPage {
  id: number;
  slug: string;
  content: string;
  html: string;
  modified_date: string;
  last_modifier_extra_info?: { full_name_display: string };
}

interface WikiLink {
  id: number;
  href: string;
  title: string;
}

function useWikiPages(projectId?: number) {
  return useQuery({
    queryKey: ['wiki', 'pages', projectId],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<WikiPage[]>('wiki', {
        query: { project: projectId! },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

function useWikiLinks(projectId?: number) {
  return useQuery({
    queryKey: ['wiki', 'links', projectId],
    enabled: Boolean(projectId),
    queryFn: () =>
      api.get<WikiLink[]>('wiki-links', {
        query: { project: projectId! },
        headers: { 'x-disable-pagination': '1' },
      }),
  });
}

function useWikiPage(projectId?: number, slug?: string) {
  return useQuery({
    queryKey: ['wiki', 'page', projectId, slug],
    enabled: Boolean(projectId && slug),
    queryFn: () =>
      api.get<WikiPage>(`wiki/by_slug`, {
        query: { project: projectId!, slug: slug! },
      }),
  });
}

export function WikiList() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { data: pages } = useWikiPages(project.id);
  return (
    <div data-testid="wiki-list">
      <h1>Wiki pages</h1>
      {pages && pages.length === 0 && <div className="empty">No wiki pages.</div>}
      {pages && (
        <ul className="list card">
          {pages.map((p) => (
            <li key={p.id}>
              <Link to={`/project/${project.slug}/wiki/${p.slug}`} className="subject-link">
                {p.slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WikiPageView() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { slug } = useParams();
  const { data: page, isPending, error } = useWikiPage(project.id, slug);
  const { data: links } = useWikiLinks(project.id);

  return (
    <div data-testid="wiki-page" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,1fr)', gap: '1.5rem' }}>
      <article>
        <h1>{slug}</h1>
        {isPending && <p className="muted">Loading…</p>}
        {error && <div className="empty">No content for this page yet.</div>}
        {page && page.html ? (
          <div className="card" data-testid="wiki-content" dangerouslySetInnerHTML={{ __html: page.html }} />
        ) : (
          page && <div className="card"><pre style={{ whiteSpace: 'pre-wrap' }}>{page.content}</pre></div>
        )}
      </article>
      <aside>
        <h2>Links</h2>
        {(links ?? []).length === 0 && <p className="muted">No wiki links.</p>}
        <ul className="list">
          {(links ?? []).map((l) => (
            <li key={l.id}>
              <Link to={`/project/${project.slug}/wiki/${l.href}`}>{l.title}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
