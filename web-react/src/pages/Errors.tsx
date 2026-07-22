import { Link, useParams } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="page" data-testid="not-found">
      <h1>404 — Not found</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-secondary">Go home</Link>
    </main>
  );
}

export function PermissionDenied() {
  return (
    <main className="page" data-testid="permission-denied">
      <h1>403 — Permission denied</h1>
      <p className="muted">You don't have access to this resource.</p>
      <Link to="/" className="btn btn-secondary">Go home</Link>
    </main>
  );
}

export function GenericError() {
  return (
    <main className="page" data-testid="error-page">
      <h1>Something went wrong</h1>
      <p className="muted">Please try again in a moment.</p>
    </main>
  );
}

export function BlockedProject() {
  const { pslug } = useParams();
  return (
    <main className="page" data-testid="blocked-project">
      <h1>Project blocked</h1>
      <p className="muted">The project <code>{pslug}</code> is blocked.</p>
    </main>
  );
}

export function ExternalApp() {
  return (
    <main className="page" data-testid="external-app">
      <h1>External application</h1>
      <p className="muted">This is the OAuth-style hand-off screen.</p>
    </main>
  );
}

export function TransferProject() {
  return (
    <main className="page" data-testid="transfer-project">
      <h1>Transfer project</h1>
      <p className="muted">Confirm or reject project ownership transfer.</p>
    </main>
  );
}
