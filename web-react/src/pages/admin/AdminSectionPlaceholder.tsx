import { useOutletContext } from 'react-router-dom';
import type { Project } from '../../auth/apiClient';
import { en } from '../../i18n/en';

type Ctx = { project: Project; slug: string };

export function AdminSectionPlaceholder({ title }: { title: string }) {
  const ctx = useOutletContext<Ctx>();
  return (
    <div className="tg-admin-placeholder">
      <h2>{title}</h2>
      <p>{en.admin.placeholder}</p>
      <p>
        <small>
          Project: {ctx.project.name} ({ctx.slug})
        </small>
      </p>
    </div>
  );
}
