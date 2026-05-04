import { useParams } from 'react-router-dom';

export function ContribPluginPage() {
  const { plugin } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Plugin: {plugin}</h1>

      <div className="card p-6">
        <p className="text-sm text-taiga-grey-light mb-4">
          This is the admin page for the <strong>{plugin}</strong> contrib plugin.
        </p>
        <div className="p-6 bg-taiga-bg rounded text-center">
          <p className="text-taiga-grey-light">
            Contrib plugin admin pages are dynamically loaded from the plugin module.
          </p>
          <p className="text-sm text-taiga-grey-light mt-2">
            If you see this page, the plugin may not be installed or configured correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
