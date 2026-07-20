/** Mirrors `generateCategoriesFromRole` in app/coffee/modules/admin/roles.coffee (read-only). */

export type PermissionDef = { key: string; label: string };

export type PermissionCategory = {
  name: string;
  permissions: PermissionDef[];
};

export const ROLE_PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: 'Epics',
    permissions: [
      { key: 'view_epics', label: 'View epics' },
      { key: 'add_epic', label: 'Add epics' },
      { key: 'modify_epic', label: 'Modify epics' },
      { key: 'comment_epic', label: 'Comment epics' },
      { key: 'delete_epic', label: 'Delete epics' },
    ],
  },
  {
    name: 'Sprints',
    permissions: [
      { key: 'view_milestones', label: 'View sprints' },
      { key: 'add_milestone', label: 'Add sprints' },
      { key: 'modify_milestone', label: 'Modify sprints' },
      { key: 'delete_milestone', label: 'Delete sprints' },
    ],
  },
  {
    name: 'User stories',
    permissions: [
      { key: 'view_us', label: 'View user stories' },
      { key: 'add_us', label: 'Add user stories' },
      { key: 'modify_us', label: 'Modify user stories' },
      { key: 'comment_us', label: 'Comment user stories' },
      { key: 'delete_us', label: 'Delete user stories' },
    ],
  },
  {
    name: 'Tasks',
    permissions: [
      { key: 'view_tasks', label: 'View tasks' },
      { key: 'add_task', label: 'Add tasks' },
      { key: 'modify_task', label: 'Modify tasks' },
      { key: 'comment_task', label: 'Comment tasks' },
      { key: 'delete_task', label: 'Delete tasks' },
    ],
  },
  {
    name: 'Issues',
    permissions: [
      { key: 'view_issues', label: 'View issues' },
      { key: 'add_issue', label: 'Add issues' },
      { key: 'modify_issue', label: 'Modify issues' },
      { key: 'comment_issue', label: 'Comment issues' },
      { key: 'delete_issue', label: 'Delete issues' },
    ],
  },
  {
    name: 'Wiki',
    permissions: [
      { key: 'view_wiki_pages', label: 'View wiki pages' },
      { key: 'add_wiki_page', label: 'Add wiki pages' },
      { key: 'modify_wiki_page', label: 'Modify wiki pages' },
      { key: 'comment_wiki_page', label: 'Comment wiki pages' },
      { key: 'delete_wiki_page', label: 'Delete wiki pages' },
    ],
  },
];

export function categoriesWithState(
  rolePermissions: string[],
  projectIsPrivate: boolean,
  externalUser: boolean,
): { name: string; activeCount: number; total: number; items: { key: string; label: string; active: boolean; disabled: boolean }[] }[] {
  return ROLE_PERMISSION_CATEGORIES.map((cat) => {
    const items = cat.permissions.map((p) => {
      const active = rolePermissions.includes(p.key);
      const disabled =
        externalUser && !projectIsPrivate && p.key.startsWith('view_') && !active;
      return { key: p.key, label: p.label, active, disabled };
    });
    const activeCount = items.filter((i) => i.active).length;
    return { name: cat.name, activeCount, total: items.length, items };
  });
}
