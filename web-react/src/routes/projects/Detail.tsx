import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteEpic,
  useDeleteIssue,
  useDeleteTask,
  useDeleteUserStory,
  useEpicByRef,
  useIssueByRef,
  useProjectBySlug,
  useTaskByRef,
  useUpdateEpic,
  useUpdateIssue,
  useUpdateTask,
  useUpdateUserStory,
  useUserStoryByRef,
} from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Markdown } from '../../components/Markdown';
import { CommentsThread } from '../../components/CommentsThread';
import { Avatar } from '../../components/Avatar';
import { useEvents } from '../../api/useEvents';
import { toast } from '../../components/Toast';
import type { ChoiceItem, ProjectSummary } from '../../api/types';

type Kind = 'us' | 'task' | 'issue' | 'epic';

export function UserStoryDetail() {
  return <DetailPage kind="us" />;
}
export function TaskDetail() {
  return <DetailPage kind="task" />;
}
export function IssueDetail() {
  return <DetailPage kind="issue" />;
}
export function EpicDetail() {
  return <DetailPage kind="epic" />;
}

interface AnyItem {
  id: number;
  ref: number;
  subject: string;
  description?: string;
  description_html?: string;
  is_closed: boolean;
  status: number;
  status_extra_info?: { name: string; color: string; is_closed: boolean };
  assigned_to?: number | null;
  assigned_to_extra_info?: { full_name_display?: string; photo?: string | null; username?: string } | null;
  owner_extra_info?: { full_name_display?: string; photo?: string | null; username?: string };
  tags?: Array<[string, string | null]> | null;
  is_blocked?: boolean;
  blocked_note?: string;
  version?: number;
  modified_date?: string;
  type?: number;
  priority?: number;
  severity?: number;
  type_extra_info?: { name: string; color: string };
  priority_extra_info?: { name: string; color: string };
  severity_extra_info?: { name: string; color: string };
  user_story?: number | null;
  user_story_extra_info?: { ref: number; subject: string } | null;
}

function DetailPage({ kind }: { kind: Kind }) {
  const params = useParams();
  const refStr =
    kind === 'us' ? params.usref : kind === 'task' ? params.taskref : kind === 'issue' ? params.issueref : params.epicref;
  const ref = refStr ? Number(refStr) : undefined;
  const { pslug } = params;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: project } = useProjectBySlug(pslug);
  const usQuery = useUserStoryByRef(kind === 'us' ? project?.id : undefined, kind === 'us' ? ref : undefined);
  const taskQuery = useTaskByRef(kind === 'task' ? project?.id : undefined, kind === 'task' ? ref : undefined);
  const issueQuery = useIssueByRef(kind === 'issue' ? project?.id : undefined, kind === 'issue' ? ref : undefined);
  const epicQuery = useEpicByRef(kind === 'epic' ? project?.id : undefined, kind === 'epic' ? ref : undefined);

  const updateUs = useUpdateUserStory();
  const updateTask = useUpdateTask();
  const updateIssue = useUpdateIssue();
  const updateEpic = useUpdateEpic();
  const deleteUs = useDeleteUserStory();
  const deleteTask = useDeleteTask();
  const deleteIssue = useDeleteIssue();
  const deleteEpic = useDeleteEpic();

  const item = (usQuery.data || taskQuery.data || issueQuery.data || epicQuery.data) as AnyItem | undefined;
  const isLoading =
    (kind === 'us' && usQuery.isLoading) ||
    (kind === 'task' && taskQuery.isLoading) ||
    (kind === 'issue' && issueQuery.isLoading) ||
    (kind === 'epic' && epicQuery.isLoading);

  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      setSubject(item.subject);
      setDescription(item.description || '');
    }
  }, [item]);

  useEvents(project && item ? `project.${project.id}.${kind === 'us' ? 'userstory' : kind}` : null, () => {
    qc.invalidateQueries({ queryKey: [kind === 'us' ? 'userstory' : kind, project?.id, ref] });
    qc.invalidateQueries({ queryKey: ['history', kind] });
  });

  if (isLoading || !item || !project) return <Loader />;

  const update = async (patch: Record<string, unknown>) => {
    const args = { id: item.id, patch: { ...patch, version: item.version } };
    if (kind === 'us') await updateUs.mutateAsync(args);
    else if (kind === 'task') await updateTask.mutateAsync(args);
    else if (kind === 'issue') await updateIssue.mutateAsync(args);
    else await updateEpic.mutateAsync(args);
  };

  const remove = async () => {
    if (!confirm(`Delete #${item.ref} – ${item.subject}?`)) return;
    if (kind === 'us') await deleteUs.mutateAsync(item.id);
    else if (kind === 'task') await deleteTask.mutateAsync(item.id);
    else if (kind === 'issue') await deleteIssue.mutateAsync(item.id);
    else await deleteEpic.mutateAsync(item.id);
    toast.success('Deleted');
    navigate(
      `/project/${pslug}/${kind === 'us' ? 'backlog' : kind === 'task' ? 'backlog' : kind === 'issue' ? 'issues' : 'epics'}`
    );
  };

  const statuses = pickStatuses(kind, project);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]" data-testid={`${kind}-detail`}>
      <article>
        <div className="text-xs text-slate-500">
          {kind.toUpperCase()} #{item.ref}
        </div>
        {editing ? (
          <input className="input mt-2 text-2xl font-semibold" value={subject} onChange={(e) => setSubject(e.target.value)} />
        ) : (
          <h1 className="mt-1 text-2xl font-semibold text-slate-800" data-testid="detail-subject">{item.subject}</h1>
        )}
        {item.is_blocked && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            🛑 Blocked: {item.blocked_note}
          </div>
        )}

        {kind === 'task' && item.user_story_extra_info && (
          <p className="mt-2 text-xs text-slate-500">
            Belongs to user story{' '}
            <a
              href={`/project/${pslug}/us/${item.user_story_extra_info.ref}`}
              className="text-taiga-700 hover:underline"
            >
              #{item.user_story_extra_info.ref} {item.user_story_extra_info.subject}
            </a>
          </p>
        )}

        <div className="mt-5 card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase text-slate-500">Description</h3>
            <div className="flex gap-2">
              {!editing && <button className="btn-secondary" onClick={() => setEditing(true)}>Edit</button>}
              {editing && (
                <>
                  <button className="btn-secondary" onClick={() => { setEditing(false); setSubject(item.subject); setDescription(item.description || ''); }}>Cancel</button>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      await update({ subject, description });
                      setEditing(false);
                      toast.success('Saved');
                    }}
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mt-3">
            {editing ? (
              <textarea
                className="input min-h-[160px] font-mono text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="description-textarea"
              />
            ) : item.description ? (
              <Markdown html={item.description_html} source={item.description} />
            ) : (
              <p className="text-sm italic text-slate-400">No description yet.</p>
            )}
          </div>
        </div>

        <CommentsThread kind={kind} itemId={item.id} version={item.version} />
      </article>

      <aside className="space-y-4">
        <div className="card p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">Status</h3>
          <select
            className="input mt-2"
            value={item.status}
            onChange={(e) => update({ status: Number(e.target.value) })}
            data-testid="status-select"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {(kind === 'issue') && (
          <div className="card p-4 space-y-3">
            <Choice
              label="Type"
              value={item.type}
              choices={project.issue_types ?? []}
              onChange={(v) => update({ type: v })}
            />
            <Choice
              label="Priority"
              value={item.priority}
              choices={project.priorities ?? []}
              onChange={(v) => update({ priority: v })}
            />
            <Choice
              label="Severity"
              value={item.severity}
              choices={project.severities ?? []}
              onChange={(v) => update({ severity: v })}
            />
          </div>
        )}

        <div className="card p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">Assigned to</h3>
          {item.assigned_to_extra_info ? (
            <div className="mt-2 flex items-center gap-2">
              <Avatar user={item.assigned_to_extra_info as any} size={28} />
              <span className="text-sm">{item.assigned_to_extra_info.full_name_display || item.assigned_to_extra_info.username}</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Unassigned</p>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">Tags</h3>
          {item.tags && item.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map(([t, c]) => (
                <span
                  key={t}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ background: c || '#e2e8f0', color: c ? '#fff' : '#475569' }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No tags</p>
          )}
        </div>

        <button className="btn-danger w-full" onClick={remove} data-testid="delete-button">Delete</button>
      </aside>
    </div>
  );
}

function pickStatuses(kind: Kind, project: ProjectSummary): ChoiceItem[] {
  if (kind === 'us') return project.us_statuses ?? [];
  if (kind === 'task') return project.task_statuses ?? [];
  if (kind === 'issue') return project.issue_statuses ?? [];
  return project.epic_statuses ?? [];
}

function Choice({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: number | undefined;
  choices: ChoiceItem[];
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
        {choices.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
