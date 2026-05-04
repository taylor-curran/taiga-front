import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useWikiPageBySlug,
  useCreateWikiPage,
  useUpdateWikiPage,
  useDeleteWikiPage,
} from '@/services/wiki';
import { Loading } from '@/components/common/Loading';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  WikiNav,
  WikiEditor,
  WikiSummary,
  WikiToc,
  WikiAttachments,
  WikiHistory,
} from '@/components/wiki';

export function WikiPageView() {
  const project = useCurrentProject();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: wiki, isLoading } = useWikiPageBySlug(project.id, slug);

  const [editing, setEditing] = useState(false);
  const createPage = useCreateWikiPage();
  const updatePage = useUpdateWikiPage(project.id);
  const deletePage = useDeleteWikiPage(project.id);

  const canEdit = project.my_permissions?.includes('modify_wiki_page');
  const canAdd = project.my_permissions?.includes('add_wiki_page');
  const canDelete = project.my_permissions?.includes('delete_wiki_page');

  // Reset editing when slug changes; auto-open editor for new pages
  const isNew = !isLoading && !wiki;
  useEffect(() => {
    setEditing(isNew && !!canAdd);
  }, [slug, isNew, canAdd]);

  const html = useMemo(() => {
    if (!wiki) return '';
    if (wiki.html) return sanitizeHtml(wiki.html);
    if (wiki.content) return sanitizeHtml(marked.parse(wiki.content) as string);
    return '';
  }, [wiki]);

  // Add heading IDs for TOC anchoring
  const htmlWithIds = useMemo(() => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let idx = 0;
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
      if (!el.id) el.id = `heading-${idx}`;
      idx++;
    });
    return doc.body.innerHTML;
  }, [html]);

  const handleSave = useCallback(
    (content: string) => {
      if (wiki?.id) {
        updatePage.mutate(
          { id: wiki.id, content, version: wiki.version },
          { onSuccess: () => setEditing(false) },
        );
      } else if (slug) {
        createPage.mutate(
          { project: project.id, slug, content },
          { onSuccess: () => setEditing(false) },
        );
      }
    },
    [wiki, slug, project.id, updatePage, createPage],
  );

  const handleDelete = useCallback(() => {
    if (!wiki?.id) return;
    if (!window.confirm(`Delete wiki page "${slug}"?`)) return;
    deletePage.mutate(wiki.id, {
      onSuccess: () => navigate(`/project/${project.slug}/wiki`),
    });
  }, [wiki, slug, project.slug, navigate, deletePage]);

  if (isLoading) return <Loading />;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Sidebar */}
      <aside className="col-span-12 lg:col-span-3">
        <div className="card p-3 sticky top-4">
          <WikiNav activeSlug={slug} />
        </div>
      </aside>

      {/* Main content */}
      <div className="col-span-12 lg:col-span-9 space-y-4">
        {editing ? (
          <div className="card p-6">
            <h1 className="text-2xl font-semibold mb-4">
              {isNew ? `New page: ${slug}` : `Editing: ${slug}`}
            </h1>
            <WikiEditor
              initialContent={wiki?.content ?? ''}
              saving={createPage.isPending || updatePage.isPending}
              onSave={handleSave}
              onCancel={() => {
                if (isNew) navigate(`/project/${project.slug}/wiki`);
                else setEditing(false);
              }}
            />
          </div>
        ) : !wiki ? (
          <div className="card p-8 text-center">
            <h2 className="text-lg font-semibold text-taiga-text mb-2">
              Page &ldquo;{slug}&rdquo; does not exist yet
            </h2>
            {canAdd ? (
              <button
                type="button"
                className="btn-primary mt-2"
                onClick={() => setEditing(true)}
              >
                Create this page
              </button>
            ) : (
              <p className="text-sm text-taiga-grey-light">
                You don&rsquo;t have permission to create wiki pages.
              </p>
            )}
          </div>
        ) : (
          <>
            <article className="card p-6">
              <header className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{wiki.slug}</h1>
                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && wiki.id && (
                    <button
                      type="button"
                      className="btn-ghost text-xs text-taiga-red"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}
                  <Link
                    to={`/project/${project.slug}/wiki-list`}
                    className="btn-ghost text-xs"
                  >
                    All pages
                  </Link>
                </div>
              </header>

              {/* Table of Contents */}
              <WikiToc html={htmlWithIds} />

              {/* Content */}
              {htmlWithIds ? (
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: htmlWithIds }}
                />
              ) : (
                <p className="text-sm text-taiga-grey-light italic">
                  This page has no content yet.
                </p>
              )}

              {/* Summary */}
              <WikiSummary wiki={wiki} />
            </article>

            {/* Attachments */}
            <WikiAttachments wikiId={wiki.id} />

            {/* History */}
            <WikiHistory wikiId={wiki.id} />
          </>
        )}
      </div>
    </div>
  );
}
