import { Link } from 'react-router-dom';

interface NotPortedProps {
  title?: string;
  area?: string;
  legacyRoute?: string;
}

export function NotPorted({
  title = 'Not yet ported to React',
  area,
  legacyRoute,
}: NotPortedProps) {
  return (
    <div className="card p-8 max-w-2xl mx-auto mt-10 text-center">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {area && (
        <p className="text-taiga-grey-light mb-4">
          The <span className="font-mono">{area}</span> view from the AngularJS app
          hasn't been re-implemented in React yet.
        </p>
      )}
      {legacyRoute && (
        <p className="text-sm text-taiga-grey-light">
          Legacy AngularJS route:{' '}
          <span className="font-mono">{legacyRoute}</span>
        </p>
      )}
      <div className="mt-6">
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
