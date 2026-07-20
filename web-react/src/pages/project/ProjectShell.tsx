import { Link, Outlet, useParams } from 'react-router-dom';

export function ProjectShell() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/">Home</Link>
        {' · '}
        <Link to={`/project/${slug}/admin/project-profile/details`}>Admin</Link>
      </nav>
      <Outlet />
    </div>
  );
}
