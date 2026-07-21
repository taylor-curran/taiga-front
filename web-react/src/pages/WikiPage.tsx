import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useParams, Link, useNavigate } from 'react-router-dom';
import { wiki as wikiApi } from '../api/resources';
import type { Project, WikiPage as WikiPageType, WikiLink } from '../types';
import Loader from '../components/common/Loader';
import HistoryPanel from '../components/detail/HistoryPanel';
import AttachmentsPanel from '../components/detail/AttachmentsPanel';
import { useState } from 'react';
import { sanitizeHtml } from '../utils/sanitize';

export default function WikiPageView() {
  const { project } = useOutletContext<{ project: Project }>();
  const { slug = 'home' } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');

  const { data: pages, isLoading: pageLoading } = useQuery({
    queryKey: ['wiki-page', project.id, slug],
    queryFn: async () => {
      const res = await wikiApi.getBySlug(project.id, slug);
      return res.data;
    },
  });

  const { data: wikiLinks } = useQuery({
    queryKey: ['wiki-links', project.id],
    queryFn: async () => {
      const res = await wikiApi.listLinks(project.id);
      return res.data;
    },
  });

  const page = pages?.[0] as WikiPageType | undefined;

  const updateMutation = useMutation({
    mutationFn: async (newContent: string) => {
      if (page) {
        return wikiApi.update(page.id, { content: newContent, version: page.version });
      } else {
        return wikiApi.create({ project: project.id, slug, content: newContent });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-page', project.id, slug] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (page) await wikiApi.delete(page.id);
    },
    onSuccess: () => {
      navigate(`/project/${project.slug}/wiki/home`);
    },
  });

  if (pageLoading) return <Loader />;

  const startEdit = () => {
    setContent(page?.content || '');
    setEditing(true);
  };

  return (
    <div className="wiki-page-view">
      <div className="wiki-layout">
        <div className="wiki-sidebar">
          <h3>Wiki Pages</h3>
          <ul className="wiki-links">
            {wikiLinks?.map((link: WikiLink) => (
              <li key={link.id}>
                <Link
                  to={`/project/${project.slug}/wiki/${link.href}`}
                  className={link.href === slug ? 'active' : ''}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={`/project/${project.slug}/wiki-list`} className="wiki-all-link">
            All pages
          </Link>
        </div>
        <div className="wiki-main">
          <div className="wiki-header">
            <h1>{slug}</h1>
            <div className="wiki-actions">
              <button className="btn btn-secondary" onClick={startEdit}>Edit</button>
              {page && (
                <button className="btn btn-danger" onClick={() => {
                  if (confirm('Delete this wiki page?')) deleteMutation.mutate();
                }}>Delete</button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="wiki-edit-form">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="wiki-editor"
              />
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={() => updateMutation.mutate(content)}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="wiki-content">
              {page?.html ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.html) }} />
              ) : (
                <div className="empty-state">
                  <p>This page doesn't exist yet.</p>
                  <button className="btn btn-primary" onClick={startEdit}>Create it</button>
                </div>
              )}
            </div>
          )}

          {page && (
            <>
              <AttachmentsPanel
                type="wiki"
                objectId={page.id}
                projectId={project.id}
                fetchFn={wikiApi.attachments}
                createFn={wikiApi.createAttachment}
                deleteFn={wikiApi.deleteAttachment}
              />
              <HistoryPanel type="wiki" objectId={page.id} projectId={project.id} version={page.version} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
