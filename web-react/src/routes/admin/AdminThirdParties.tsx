import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useProjectBySlug, useWebhooks } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { api } from '../../api/client';
import { toast } from '../../components/Toast';
import { useQueryClient } from '@tanstack/react-query';

export function AdminWebhooks() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: hooks, isLoading: lh, refetch } = useWebhooks(project?.id);
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  if (lp || lh) return <Loader />;
  if (!project) return null;

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    await api().post('webhooks', { project: project.id, name, url, key });
    setName('');
    setUrl('');
    setKey('');
    refetch();
    qc.invalidateQueries({ queryKey: ['webhooks'] });
    toast.success('Webhook added');
  };

  const onDelete = async (id: number) => {
    if (!confirm('Remove this webhook?')) return;
    await api().delete(`webhooks/${id}`);
    refetch();
  };

  return (
    <div data-testid="admin-webhooks">
      <h2 className="text-lg font-semibold">Webhooks</h2>
      <ul className="mt-4 card divide-y divide-slate-100">
        {((hooks as Array<Record<string, unknown>>) ?? []).map((h) => (
          <li key={String(h.id)} className="flex items-center justify-between p-3 text-sm">
            <div>
              <div className="font-semibold">{String(h.name)}</div>
              <div className="text-xs text-slate-500">{String(h.url)}</div>
            </div>
            <button className="text-slate-400 hover:text-red-600" onClick={() => onDelete(h.id as number)}>×</button>
          </li>
        ))}
      </ul>
      <form className="mt-4 card grid gap-3 p-4 sm:grid-cols-3" onSubmit={onAdd}>
        <input className="input" required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" required placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <input className="input" required placeholder="Secret key" value={key} onChange={(e) => setKey(e.target.value)} />
        <button className="btn-primary sm:col-span-3">Add webhook</button>
      </form>
    </div>
  );
}

export function AdminGitHubIntegration() {
  return <IntegrationStub title="GitHub" />;
}
export function AdminGitLabIntegration() {
  return <IntegrationStub title="GitLab" />;
}
export function AdminBitbucketIntegration() {
  return <IntegrationStub title="Bitbucket" />;
}
export function AdminGogsIntegration() {
  return <IntegrationStub title="Gogs" />;
}

function IntegrationStub({ title }: { title: string }) {
  const { pslug } = useParams();
  const { data: project, isLoading } = useProjectBySlug(pslug);
  if (isLoading || !project) return <Loader />;
  const projectId = project.id;
  return (
    <div data-testid={`admin-${title.toLowerCase()}`}>
      <h2 className="text-lg font-semibold">{title} integration</h2>
      <p className="mt-2 text-sm text-slate-500">
        Configure the {title} hook URL by hitting <code>POST /api/v1/{title.toLowerCase()}-modules/{projectId}/</code>{' '}
        from a client. The same URL is used for the AngularJS app.
      </p>
    </div>
  );
}
