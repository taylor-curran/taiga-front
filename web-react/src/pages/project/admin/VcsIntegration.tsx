import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useProjectModules } from '@/services/admin';

interface VcsIntegrationPageProps {
  provider: 'github' | 'gitlab' | 'bitbucket' | 'gogs';
  title: string;
  docUrl: string;
}

export function VcsIntegrationPage({ provider, title, docUrl }: VcsIntegrationPageProps) {
  const project = useCurrentProject();
  const { data: modules, isLoading } = useProjectModules(project.id);

  const config = modules?.[provider] as
    | { secret: string; webhooks_url: string; valid_origin_ips?: string }
    | undefined;

  if (isLoading) {
    return <div className="text-taiga-grey-light p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title} Integration</h1>

      <div className="card p-6">
        <p className="text-sm text-taiga-grey-light mb-6">
          Connect this project with your {title} repository to automatically sync issues, pull
          requests, and commits.{' '}
          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-taiga-link underline">
            Read the documentation
          </a>
        </p>

        {config ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Webhook Secret</label>
              <div className="flex items-center gap-2">
                <code className="bg-taiga-bg px-3 py-2 rounded text-sm flex-1 break-all select-all">
                  {config.secret}
                </code>
              </div>
              <p className="text-xs text-taiga-grey-light mt-1">
                Use this secret when configuring the webhook in your {title} repository settings.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <div className="flex items-center gap-2">
                <code className="bg-taiga-bg px-3 py-2 rounded text-sm flex-1 break-all select-all">
                  {config.webhooks_url}
                </code>
              </div>
              <p className="text-xs text-taiga-grey-light mt-1">
                Configure this URL as the payload URL in your {title} webhook settings.
              </p>
            </div>

            {config.valid_origin_ips && (
              <div>
                <label className="block text-sm font-medium mb-1">Valid Origin IPs</label>
                <code className="bg-taiga-bg px-3 py-2 rounded text-sm block break-all">
                  {config.valid_origin_ips}
                </code>
              </div>
            )}

            <div className="mt-4 p-4 bg-taiga-bg rounded text-sm">
              <h3 className="font-semibold mb-2">Setup Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-taiga-grey">
                <li>Go to your {title} repository settings</li>
                <li>Navigate to Webhooks</li>
                <li>Add a new webhook with the URL above</li>
                <li>Set the secret to the value shown above</li>
                <li>Select events: Push, Issues, Pull Requests</li>
                <li>Save the webhook</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-taiga-bg rounded text-center">
            <p className="text-taiga-grey-light mb-3">
              No {title} integration module found for this project.
            </p>
            <p className="text-sm text-taiga-grey-light">
              The {title} integration module may not be enabled. Check the Modules section in
              Project Profile settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function GitHubIntegrationPage() {
  return (
    <VcsIntegrationPage
      provider="github"
      title="GitHub"
      docUrl="https://docs.taiga.io/integrations-github.html"
    />
  );
}

export function GitLabIntegrationPage() {
  return (
    <VcsIntegrationPage
      provider="gitlab"
      title="GitLab"
      docUrl="https://docs.taiga.io/integrations-gitlab.html"
    />
  );
}

export function BitbucketIntegrationPage() {
  return (
    <VcsIntegrationPage
      provider="bitbucket"
      title="Bitbucket"
      docUrl="https://docs.taiga.io/integrations-bitbucket.html"
    />
  );
}

export function GogsIntegrationPage() {
  return (
    <VcsIntegrationPage
      provider="gogs"
      title="Gogs"
      docUrl="https://docs.taiga.io/integrations-gogs.html"
    />
  );
}
