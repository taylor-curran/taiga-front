import { useParams, Link } from 'react-router-dom';

export default function BlockedProjectPage() {
  const { pslug } = useParams<{ pslug: string }>();

  return (
    <div className="error-page blocked-project">
      <h1>Blocked Project</h1>
      <p>
        The project <strong>{pslug}</strong> has been blocked by an administrator.
      </p>
      <p>Please contact the project owner for more information.</p>
      <Link to="/" className="btn btn-primary">Go to home</Link>
    </div>
  );
}
