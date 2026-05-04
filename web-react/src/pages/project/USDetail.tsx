import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useUserStoryByRef, usePatchUserStory } from '@/services/userstories';
import { useTasks } from '@/services/tasks';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Tags } from '@/components/common/Tags';
import { Avatar } from '@/components/common/Avatar';
import { sanitizeHtml } from '@/lib/sanitize';
import { AttachmentsSection } from '@/components/userstory/AttachmentsSection';
import { CommentsSection } from '@/components/userstory/CommentsSection';
import { CustomFieldsSection } from '@/components/userstory/CustomFieldsSection';
import { PointsEditor } from '@/components/userstory/PointsEditor';
import { WatchersVoters } from '@/components/userstory/WatchersVoters';
import type { RolePointsEntry } from '@/types/api';

export function USDetailPage() {
  const project = useCurrentProject();
  const { usref } = useParams();
  const ref = Number(usref);
  const { data: us, isLoading, error } = useUserStoryByRef(project.id, ref);
  const tasksQuery = useTasks(
    us ? { project: project.id, user_story: us.id } : undefined,
  );
  const patchStory = usePatchUserStory();

  // Inline editing state
  const [editingSubject, setEditingSubject] = useState(false);
  const [subjectValue, setSubjectValue] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');

  const handleSaveSubject = useCallback(() => {
    if (us && subjectValue.trim() && subjectValue.trim() !== us.subject) {
      patchStory.mutate({ id: us.id, data: { subject: subjectValue.trim() } });
    }
    setEditingSubject(false);
  }, [us, subjectValue, patchStory]);

  const handleSaveDescription = useCallback(() => {
    if (us) {
      patchStory.mutate({ id: us.id, data: { description: descriptionValue } });
    }
    setEditingDescription(false);
  }, [us, descriptionValue, patchStory]);

  const handleStatusChange = useCallback(
    (statusId: number) => {
      if (us) patchStory.mutate({ id: us.id, data: { status: statusId } });
    },
    [us, patchStory],
  );

  const handleAssignChange = useCallback(
    (userId: number | null) => {
      if (us) patchStory.mutate({ id: us.id, data: { assigned_to: userId } });
    },
    [us, patchStory],
  );

  const handlePointsSave = useCallback(
    (points: RolePointsEntry) => {
      if (us) patchStory.mutate({ id: us.id, data: { points } });
    },
    [us, patchStory],
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!us) return <ErrorBox message="User story not found" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      {/* Main content */}
      <article className="space-y-6">
        {/* Navigation */}
        <nav className="flex items-center gap-2 text-sm text-taiga-grey-light">
          <Link to={`/project/${project.slug}/backlog`} className="hover:text-taiga-primary">
            Backlog
          </Link>
          <span>/</span>
          <span className="font-mono">US #{us.ref}</span>
          {us.neighbors?.previous && (
            <Link
              to={`/project/${project.slug}/us/${us.neighbors.previous.ref}`}
              className="ml-auto text-taiga-grey-light hover:text-taiga-primary"
              title={us.neighbors.previous.subject}
            >
              \u2190 Prev
            </Link>
          )}
          {us.neighbors?.next && (
            <Link
              to={`/project/${project.slug}/us/${us.neighbors.next.ref}`}
              className="text-taiga-grey-light hover:text-taiga-primary"
              title={us.neighbors.next.subject}
            >
              Next \u2192
            </Link>
          )}
        </nav>

        {/* Header */}
        <header className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-taiga-grey-light font-mono mb-1">US #{us.ref}</p>
              {editingSubject ? (
                <input
                  type="text"
                  value={subjectValue}
                  onChange={(e) => setSubjectValue(e.target.value)}
                  onBlur={handleSaveSubject}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSubject();
                    if (e.key === 'Escape') setEditingSubject(false);
                  }}
                  className="text-2xl font-semibold w-full border-b-2 border-taiga-primary focus:outline-none"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-2xl font-semibold cursor-pointer hover:text-taiga-primary"
                  onClick={() => { setSubjectValue(us.subject); setEditingSubject(true); }}
                >
                  {us.subject}
                </h1>
              )}
            </div>
            <WatchersVoters us={us} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {us.status_extra_info?.name && (
              <span
                className="badge"
                style={
                  us.status_extra_info.color
                    ? { backgroundColor: us.status_extra_info.color, color: '#fff' }
                    : undefined
                }
              >
                {us.status_extra_info.name}
              </span>
            )}
            <span className="badge bg-taiga-bg border border-taiga-grey-lighter/40">
              {us.total_points ?? '\u2014'} pts
            </span>
            {us.is_blocked && (
              <span className="badge bg-red-500 text-white">Blocked</span>
            )}
            {us.milestone_name && (
              <span className="badge bg-taiga-secondary/10 text-taiga-secondary border border-taiga-secondary/30">
                {us.milestone_name}
              </span>
            )}
            <Tags tags={us.tags} />
          </div>

          {/* Epics */}
          {us.epics && us.epics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {us.epics.map((epic) => (
                <Link
                  key={epic.id}
                  to={`/project/${project.slug}/epic/${epic.ref}`}
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ borderColor: epic.color ?? '#ccc', color: epic.color ?? '#666' }}
                >
                  {epic.subject}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Description */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-taiga-text">Description</h2>
            {!editingDescription && (
              <button
                onClick={() => { setDescriptionValue(us.description ?? ''); setEditingDescription(true); }}
                className="text-xs text-taiga-primary hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editingDescription ? (
            <div>
              <textarea
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                rows={8}
                className="w-full border border-taiga-grey-lighter rounded px-3 py-2 text-sm focus:outline-none focus:border-taiga-primary resize-y"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-3 py-1.5 bg-taiga-primary text-white text-sm rounded hover:bg-taiga-primary/90"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingDescription(false)}
                  className="px-3 py-1.5 text-sm text-taiga-grey-light hover:text-taiga-text"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : us.description_html ? (
            <div
              className="prose max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(us.description_html) }}
            />
          ) : us.description ? (
            <p className="whitespace-pre-wrap text-sm">{us.description}</p>
          ) : (
            <p className="text-sm text-taiga-grey-light italic">No description.</p>
          )}
        </section>

        {/* Tasks */}
        <section className="card p-6">
          <h2 className="font-semibold text-taiga-text mb-3">
            Tasks
            {tasksQuery.data && tasksQuery.data.length > 0 && (
              <span className="ml-1 text-xs text-taiga-grey-light">({tasksQuery.data.length})</span>
            )}
          </h2>
          {tasksQuery.isLoading && <Loading />}
          {tasksQuery.data && tasksQuery.data.length === 0 && (
            <p className="text-sm text-taiga-grey-light italic">No tasks for this story.</p>
          )}
          {tasksQuery.data && tasksQuery.data.length > 0 && (
            <ul className="divide-y divide-taiga-grey-lighter/40 border border-taiga-grey-lighter/40 rounded">
              {tasksQuery.data.map((t) => (
                <li
                  key={t.id}
                  className="px-3 py-2 flex items-center gap-3 hover:bg-taiga-bg/60"
                >
                  <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
                    #{t.ref}
                  </span>
                  <Link
                    to={`/project/${project.slug}/task/${t.ref}`}
                    className="flex-1 truncate text-taiga-text hover:text-taiga-primary"
                  >
                    {t.subject}
                  </Link>
                  {t.status_extra_info?.name && (
                    <span
                      className="badge text-xs"
                      style={
                        t.status_extra_info.color
                          ? { backgroundColor: t.status_extra_info.color, color: '#fff' }
                          : undefined
                      }
                    >
                      {t.status_extra_info.name}
                    </span>
                  )}
                  {t.assigned_to_extra_info?.full_name_display && (
                    <span className="text-xs text-taiga-grey-light">
                      {t.assigned_to_extra_info.full_name_display}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Attachments */}
        <div className="card p-6">
          <AttachmentsSection usId={us.id} projectId={project.id} />
        </div>

        {/* Custom Fields */}
        <div className="card p-6">
          <CustomFieldsSection usId={us.id} projectId={project.id} />
        </div>

        {/* Comments & Activity */}
        <div className="card p-6">
          <CommentsSection usId={us.id} version={us.version ?? 1} />
        </div>
      </article>

      {/* Sidebar */}
      <aside className="space-y-4">
        {/* Status */}
        <div className="card p-4">
          <h3 className="text-xs font-medium text-taiga-grey-light uppercase mb-2">Status</h3>
          <select
            value={us.status}
            onChange={(e) => handleStatusChange(Number(e.target.value))}
            className="w-full text-sm border border-taiga-grey-lighter rounded px-2 py-1.5 focus:outline-none focus:border-taiga-primary"
          >
            {project.us_statuses?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned to */}
        <div className="card p-4">
          <h3 className="text-xs font-medium text-taiga-grey-light uppercase mb-2">Assigned to</h3>
          <select
            value={us.assigned_to ?? ''}
            onChange={(e) => handleAssignChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full text-sm border border-taiga-grey-lighter rounded px-2 py-1.5 focus:outline-none focus:border-taiga-primary"
          >
            <option value="">Unassigned</option>
            {project.members
              ?.filter((m) => m.is_active)
              .map((m) => (
                <option key={m.id} value={m.user}>
                  {m.full_name || m.username || m.user_email}
                </option>
              ))}
          </select>
          {us.assigned_to_extra_info?.full_name_display && (
            <div className="mt-2 flex items-center gap-2">
              <Avatar
                name={us.assigned_to_extra_info.full_name_display}
                src={us.assigned_to_extra_info.photo}
                size={24}
              />
              <span className="text-sm text-taiga-text">
                {us.assigned_to_extra_info.full_name_display}
              </span>
            </div>
          )}
        </div>

        {/* Points */}
        <div className="card p-4">
          <h3 className="text-xs font-medium text-taiga-grey-light uppercase mb-2">Points</h3>
          <div className="text-lg font-semibold text-taiga-primary mb-2">
            {us.total_points ?? '\u2014'} pts
          </div>
          <PointsEditor points={us.points} project={project} onSave={handlePointsSave} />
        </div>

        {/* Due date */}
        <div className="card p-4">
          <h3 className="text-xs font-medium text-taiga-grey-light uppercase mb-2">Due Date</h3>
          <input
            type="date"
            value={us.due_date ?? ''}
            onChange={(e) =>
              patchStory.mutate({ id: us.id, data: { due_date: e.target.value || null } })
            }
            className="w-full text-sm border border-taiga-grey-lighter rounded px-2 py-1.5 focus:outline-none focus:border-taiga-primary"
          />
          {us.due_date_status === 'past_due' && (
            <span className="text-xs text-red-500 mt-1 block">Past due</span>
          )}
        </div>

        {/* Tags */}
        <div className="card p-4">
          <h3 className="text-xs font-medium text-taiga-grey-light uppercase mb-2">Tags</h3>
          <Tags tags={us.tags} />
          {(!us.tags || us.tags.length === 0) && (
            <p className="text-xs text-taiga-grey-light italic">No tags</p>
          )}
        </div>

        {/* Meta */}
        <div className="card p-4 text-xs text-taiga-grey-light space-y-1">
          {us.created_date && (
            <p>Created: {new Date(us.created_date).toLocaleDateString()}</p>
          )}
          {us.modified_date && (
            <p>Modified: {new Date(us.modified_date).toLocaleDateString()}</p>
          )}
          {us.owner_extra_info?.full_name_display && (
            <p>Owner: {us.owner_extra_info.full_name_display}</p>
          )}
        </div>
      </aside>
    </div>
  );
}
