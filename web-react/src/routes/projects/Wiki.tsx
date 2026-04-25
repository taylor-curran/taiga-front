import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateWikiLink,
  useCreateWikiPage,
  useDeleteWikiLink,
  useDeleteWikiPage,
  useProjectBySlug,
  useUpdateWikiPage,
  useWikiLinks,
  useWikiPageBySlug,
  useWikiPages,
} from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Markdown } from '../../components/Markdown';
import { useEvents } from '../../api/useEvents';
import { toast } from '../../components/Toast';
import { formatDate } from '../../utils/dates';

export function WikiPage() {
  const { pslug, slug } = useParams();
  const navigate = useNavigate();
  const { data: project } = useProjectBySlug(pslug);
  const { data: page, isLoading } = useWikiPageBySlug(project?.id, slug);
  const { data: links } = useWikiLinks(project?.id);
  const update = useUpdateWikiPage();
  const create = useCreateWikiPage();
  const remove = useDeleteWikiPage();
  const createLink = useCreateWikiLink();
  const deleteLink = useDeleteWikiLink();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkHref, setLinkHref] = useState('');

  useEffect(() => {
    setContent(page?.content || '');
  }, [page]);

  useEvents(project ? `project.${project.id}.wikipage` : null, () => {
    qc.invalidateQueries({ queryKey: ['wiki'] });
  });

  if (isLoading || !project) return <Loader />;

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (page) {
      await update.mutateAsync({ id: page.id, patch: { content, version: page.version } });
      toast.success('Page saved');
    } else {
      await create.mutateAsync({ project: project.id, slug: slug!, content });
      toast.success('Page created');
    }
    setEditing(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_240px]" data-testid="wiki">
      <article>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold capitalize text-slate-800" data-testid="wiki-title">
            {slug?.replace(/-/g, ' ')}
          </h1>
          <div className="flex gap-2">
            {page && !editing && (
              <button className="btn-secondary" onClick={() => setEditing(true)}>Edit</button>
            )}
            {page && editing && (
              <button className="btn-secondary" onClick={() => { setContent(page?.content || ''); setEditing(false); }}>Cancel</button>
            )}
            {page && (
              <button
                className="btn-danger"
                onClick={async () => {
                  if (confirm('Delete this page?')) {
                    await remove.mutateAsync(page.id);
                    toast.success('Page deleted');
                    navigate(`/project/${pslug}/wiki/home`);
                  }
                }}
              >
                Delete
              </button>
            )}
            <Link to={`/project/${pslug}/wiki-list`} className="btn-secondary">All pages</Link>
          </div>
        </div>
        {page && (
          <p className="mt-1 text-xs text-slate-400">Last modified {formatDate(page.modified_date)}</p>
        )}
        {page && !editing ? (
          <div className="mt-4 card p-5" data-testid="wiki-content">
            <Markdown html={page.html} source={page.content} />
          </div>
        ) : (
          <form onSubmit={onSave} className="mt-4 card p-4">
            {!page && (
              <p className="mb-2 text-sm text-amber-600">
                This page does not exist yet. Add some content and save to create it.
              </p>
            )}
            <textarea
              className="input min-h-[320px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              data-testid="wiki-textarea"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        )}
      </article>

      <aside className="card h-fit p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-slate-500">Sidebar</h3>
          <button onClick={() => setShowLink((v) => !v)} className="text-xs text-taiga-700 hover:underline">
            {showLink ? 'Cancel' : '+ link'}
          </button>
        </div>
        {showLink && (
          <form
            className="mt-2 space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!project) return;
              await createLink.mutateAsync({ project: project.id, title: linkTitle, href: linkHref });
              setShowLink(false);
              setLinkTitle('');
              setLinkHref('');
              toast.success('Wiki link added');
            }}
          >
            <input className="input text-sm" placeholder="Title" required value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
            <input className="input text-sm" placeholder="page-slug" required value={linkHref} onChange={(e) => setLinkHref(e.target.value)} />
            <button className="btn-primary w-full text-sm">Add</button>
          </form>
        )}
        <ul className="mt-4 space-y-1 text-sm">
          <li>
            <Link to={`/project/${pslug}/wiki/home`} className="text-taiga-700 hover:underline">home</Link>
          </li>
          {(links || []).map((l) => (
            <li key={l.id} className="group flex items-center justify-between">
              <Link to={`/project/${pslug}/wiki/${l.href}`} className="text-taiga-700 hover:underline">{l.title}</Link>
              <button
                className="text-xs text-slate-300 hover:text-red-500 group-hover:opacity-100"
                onClick={() => deleteLink.mutateAsync(l.id)}
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <Link to={`/project/${pslug}/wiki-list`} className="mt-4 block text-xs text-slate-500 hover:underline">
          See all pages →
        </Link>
      </aside>
    </div>
  );
}

export function WikiList() {
  const { pslug } = useParams();
  const { data: project } = useProjectBySlug(pslug);
  const { data: pages, isLoading } = useWikiPages(project?.id);
  return (
    <div data-testid="wiki-list">
      <h1 className="text-xl font-semibold text-slate-800">Wiki pages</h1>
      <p className="text-sm text-slate-500">{pages?.length ?? 0} pages</p>
      {isLoading ? (
        <Loader />
      ) : (
        <ul className="mt-5 divide-y divide-slate-100 card">
          {pages?.map((p) => (
            <li key={p.id} className="p-3">
              <Link to={`/project/${pslug}/wiki/${p.slug}`} className="text-taiga-700 hover:underline">
                {p.slug}
              </Link>
              <span className="ml-3 text-xs text-slate-400">{formatDate(p.modified_date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
