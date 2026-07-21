import { useOutletContext, NavLink, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberships, roles as rolesApi, projects as projectsApi } from '../api/resources';
import type { Project, Membership, Role } from '../types';
import { useState } from 'react';

function ProjectProfileDetails({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => projectsApi.update(project.id, data as Partial<Project>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', project.slug] }),
  });

  return (
    <div className="admin-section">
      <h2>Project Details</h2>
      <div className="form-field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <button className="btn btn-primary" onClick={() => updateMutation.mutate({ name, description })}>Save</button>
    </div>
  );
}

function MembershipsAdmin({ project }: { project: Project }) {
  const { data: membersList } = useQuery({
    queryKey: ['admin-memberships', project.id],
    queryFn: async () => {
      const res = await memberships.list(project.id);
      return res.data;
    },
  });

  return (
    <div className="admin-section">
      <h2>Members</h2>
      <div className="members-list">
        {membersList?.map((m: Membership) => (
          <div key={m.id} className="member-row">
            <span className="member-name">{m.full_name || m.email}</span>
            <span className="member-role">{m.role_name}</span>
            {m.is_admin && <span className="badge badge-admin">Admin</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesAdmin({ project }: { project: Project }) {
  const { data: rolesList } = useQuery({
    queryKey: ['admin-roles', project.id],
    queryFn: async () => {
      const res = await rolesApi.list(project.id);
      return res.data;
    },
  });

  return (
    <div className="admin-section">
      <h2>Roles</h2>
      <div className="roles-list">
        {(rolesList as Role[] | undefined)?.map((r: Role) => (
          <div key={r.id} className="role-row">
            <span className="role-name">{r.name}</span>
            <span className="role-members">{r.members_count} members</span>
            <span className="role-computable">{r.computable ? 'Computable' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModulesAdmin({ project }: { project: Project }) {
  const { data: modules } = useQuery({
    queryKey: ['admin-modules', project.id],
    queryFn: async () => {
      const res = await projectsApi.getModules(project.id);
      return res.data;
    },
  });

  return (
    <div className="admin-section">
      <h2>Modules</h2>
      {modules && (
        <div className="modules-list">
          {Object.entries(modules as Record<string, unknown>).map(([key, value]) => (
            <div key={key} className="module-row">
              <span className="module-name">{key}</span>
              <span className="module-status">{value ? 'Enabled' : 'Disabled'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const location = useLocation();
  const path = location.pathname;
  const base = `/project/${project.slug}/admin`;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>Project Admin</h2>
        <nav>
          <NavLink to={`${base}/project-profile/details`} className={({ isActive }) => isActive ? 'active' : ''}>Details</NavLink>
          <NavLink to={`${base}/project-profile/default-values`} className={({ isActive }) => isActive ? 'active' : ''}>Default values</NavLink>
          <NavLink to={`${base}/project-profile/modules`} className={({ isActive }) => isActive ? 'active' : ''}>Modules</NavLink>
          <NavLink to={`${base}/memberships`} className={({ isActive }) => isActive ? 'active' : ''}>Members</NavLink>
          <NavLink to={`${base}/roles`} className={({ isActive }) => isActive ? 'active' : ''}>Roles</NavLink>
          <NavLink to={`${base}/project-values/status`} className={({ isActive }) => isActive ? 'active' : ''}>Statuses</NavLink>
          <NavLink to={`${base}/project-values/points`} className={({ isActive }) => isActive ? 'active' : ''}>Points</NavLink>
          <NavLink to={`${base}/project-values/custom-fields`} className={({ isActive }) => isActive ? 'active' : ''}>Custom fields</NavLink>
          <NavLink to={`${base}/third-parties/webhooks`} className={({ isActive }) => isActive ? 'active' : ''}>Webhooks</NavLink>
        </nav>
      </div>
      <div className="admin-content">
        {path.includes('project-profile/details') && <ProjectProfileDetails project={project} />}
        {path.includes('project-profile/modules') && <ModulesAdmin project={project} />}
        {path.includes('memberships') && <MembershipsAdmin project={project} />}
        {path.includes('roles') && !path.includes('project') && <RolesAdmin project={project} />}
        {!path.includes('project-profile') && !path.includes('memberships') && !path.includes('roles') && !path.includes('third-parties') && (
          <div className="admin-section">
            <h2>Admin</h2>
            <p>Select a section from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
