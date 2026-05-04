import { Link } from 'react-router-dom';

export function ErrorPage({ status = 500, message = 'An unexpected error occurred.' }: { status?: number; message?: string }) {
  return (
    <div className="card p-10 max-w-xl mx-auto mt-10 text-center">
      <h1 className="text-3xl font-semibold mb-2">Error {status}</h1>
      <p className="text-taiga-grey-light mb-4">{message}</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}

export function NotFoundPage() {
  return <ErrorPage status={404} message="The page you're looking for doesn't exist." />;
}

export function BlockedProjectPage() {
  return (
    <div className="card p-10 max-w-xl mx-auto mt-10 text-center">
      <h1 className="text-3xl font-semibold mb-2">Project is blocked</h1>
      <p className="text-taiga-grey-light mb-4">
        Access to this project has been temporarily disabled.
      </p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
