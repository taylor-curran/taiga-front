import { useState } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookLogs,
} from '@/services/admin';
import type { Webhook } from '@/types/admin';

function WebhookLogPanel({ webhookId }: { webhookId: number }) {
  const { data: logs = [], isLoading } = useWebhookLogs(webhookId);

  if (isLoading) return <p className="text-xs text-taiga-grey-light p-2">Loading logs...</p>;
  if (logs.length === 0) return <p className="text-xs text-taiga-grey-light p-2">No logs yet.</p>;

  return (
    <div className="max-h-60 overflow-y-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left border-b border-taiga-bg">
            <th className="px-2 py-1">Date</th>
            <th className="px-2 py-1">URL</th>
            <th className="px-2 py-1 w-16">Status</th>
            <th className="px-2 py-1 w-20">Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const ok = log.status >= 200 && log.status < 300;
            return (
              <tr key={log.id} className="border-b border-taiga-bg last:border-0">
                <td className="px-2 py-1 text-taiga-grey-light">
                  {new Date(log.created).toLocaleString()}
                </td>
                <td className="px-2 py-1 truncate max-w-xs">{log.url}</td>
                <td className={`px-2 py-1 font-semibold ${ok ? 'text-taiga-green-dark' : 'text-taiga-red'}`}>
                  {log.status}
                </td>
                <td className="px-2 py-1 text-taiga-grey-light">{log.duration}ms</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WebhookRow({
  webhook,
  onUpdate,
  onDelete,
  onTest,
}: {
  webhook: Webhook;
  onUpdate: (data: Partial<Webhook> & { id: number }) => void;
  onDelete: (id: number) => void;
  onTest: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(webhook.name);
  const [url, setUrl] = useState(webhook.url);
  const [key, setKey] = useState(webhook.key);
  const [showLogs, setShowLogs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onUpdate({ id: webhook.id, name, url, key });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(webhook.name);
    setUrl(webhook.url);
    setKey(webhook.key);
    setIsEditing(false);
  };

  return (
    <div className="border-b border-taiga-bg last:border-0 p-4">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">URL</label>
              <input className="input w-full" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Secret Key</label>
              <input className="input w-full" value={key} onChange={(e) => setKey(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-primary text-sm" onClick={handleSave}>Save</button>
            <button type="button" className="btn-secondary text-sm" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{webhook.name}</p>
            <p className="text-xs text-taiga-grey-light truncate max-w-md">{webhook.url}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-taiga-grey-light">
              {webhook.logs_counter} log{webhook.logs_counter !== 1 ? 's' : ''}
            </span>
            <button type="button" className="text-taiga-link text-xs" onClick={() => setShowLogs(!showLogs)}>
              {showLogs ? 'Hide Logs' : 'Show Logs'}
            </button>
            <button type="button" className="text-taiga-link text-xs" onClick={() => onTest(webhook.id)}>
              Test
            </button>
            <button type="button" className="text-taiga-link text-xs" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            {confirmDelete ? (
              <>
                <button type="button" className="text-taiga-red text-xs" onClick={() => onDelete(webhook.id)}>Confirm</button>
                <button type="button" className="text-taiga-grey text-xs" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="text-taiga-red text-xs" onClick={() => setConfirmDelete(true)}>Delete</button>
            )}
          </div>
        </div>
      )}
      {showLogs && (
        <div className="mt-3 bg-taiga-bg/50 rounded p-2">
          <WebhookLogPanel webhookId={webhook.id} />
        </div>
      )}
    </div>
  );
}

export function WebhooksPage() {
  const project = useCurrentProject();
  const { data: webhooks = [], isLoading } = useWebhooks(project.id);
  const createWebhook = useCreateWebhook(project.id);
  const updateWebhook = useUpdateWebhook(project.id);
  const deleteWebhook = useDeleteWebhook(project.id);
  const testWebhook = useTestWebhook();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newKey, setNewKey] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    await createWebhook.mutateAsync({ name: newName.trim(), url: newUrl.trim(), key: newKey });
    setNewName('');
    setNewUrl('');
    setNewKey('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <button type="button" className="btn-primary text-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Webhook'}
        </button>
      </div>

      {showAdd && (
        <div className="card p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input className="input w-full" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Payload URL</label>
                <input className="input w-full" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Secret Key</label>
                <input className="input w-full" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary text-sm" disabled={createWebhook.isPending}>
              {createWebhook.isPending ? 'Creating...' : 'Create Webhook'}
            </button>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-taiga-grey-light text-sm">Loading...</div>
        ) : webhooks.length === 0 ? (
          <div className="p-8 text-center text-taiga-grey-light">
            No webhooks configured. Add one to get started.
          </div>
        ) : (
          webhooks.map((wh) => (
            <WebhookRow
              key={wh.id}
              webhook={wh}
              onUpdate={(data) => updateWebhook.mutate(data)}
              onDelete={(id) => deleteWebhook.mutate(id)}
              onTest={(id) => testWebhook.mutate(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
