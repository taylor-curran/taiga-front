import { useState, useCallback, type FormEvent } from 'react';
import type { ProjectDetail } from '@/types/api';

interface CreateIssueModalProps {
  project: ProjectDetail;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    subject: string;
    description: string;
    type: number;
    severity: number;
    priority: number;
    status: number;
    assigned_to: number | null;
    tags: string[];
  }) => void;
  isSubmitting: boolean;
}

export function CreateIssueModal({
  project,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateIssueModalProps) {
  const types = project.issue_types ?? [];
  const severities = project.severities ?? [];
  const priorities = project.priorities ?? [];
  const statuses = project.issue_statuses ?? [];
  const members = project.members ?? [];

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(types[0]?.id ?? 0);
  const [severity, setSeverity] = useState(severities[0]?.id ?? 0);
  const [priority, setPriority] = useState(priorities[0]?.id ?? 0);
  const [status, setStatus] = useState(statuses[0]?.id ?? 0);
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!subject.trim()) return;
      onSubmit({
        subject: subject.trim(),
        description,
        type,
        severity,
        priority,
        status,
        assigned_to: assignedTo,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    },
    [subject, description, type, severity, priority, status, assignedTo, tagsInput, onSubmit],
  );

  const handleReset = useCallback(() => {
    setSubject('');
    setDescription('');
    setType(types[0]?.id ?? 0);
    setSeverity(severities[0]?.id ?? 0);
    setPriority(priorities[0]?.id ?? 0);
    setStatus(statuses[0]?.id ?? 0);
    setAssignedTo(null);
    setTagsInput('');
  }, [types, severities, priorities, statuses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">New Issue</h2>
          <button
            className="text-taiga-grey-light hover:text-taiga-text text-xl"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              className="input w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              autoFocus
              placeholder="Issue title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="input w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="input w-full"
                value={type}
                onChange={(e) => setType(Number(e.target.value))}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select
                className="input w-full"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
              >
                {severities.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="input w-full"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="input w-full"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assigned to</label>
            <select
              className="input w-full"
              value={assignedTo ?? ''}
              onChange={(e) =>
                setAssignedTo(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.user ?? m.id}>
                  {m.full_name || m.username || `Member #${m.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              className="input w-full"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-taiga-grey-light mt-0.5">Comma-separated</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn"
              onClick={() => {
                handleReset();
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !subject.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
