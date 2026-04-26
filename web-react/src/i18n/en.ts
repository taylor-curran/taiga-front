/**
 * English copy aligned with `app/locales/taiga/locale-en.json` for listing pages.
 */
export const en = {
  home: {
    dashboard: 'Projects Dashboard',
    workingOn: 'Working on',
    watching: 'Watching',
    emptyWorkingOn:
      "It feels empty, doesn't it? Start working with Taiga and you'll see here the stories, tasks and issues you are working on.",
    emptyWatching:
      'Follow user stories, tasks, issues in your projects and be notified about their changes :)',
    noHiddenItems: 'You have no hidden items',
  },
  projects: {
    myProjects: 'My projects',
    help: 'Do you need help? Check out our support page!',
    actionCreate: 'New project',
    emptyList: "You don't have any project yet",
    /** `PROJECT.NAVIGATION.MANAGE_PROJECTS` */
    manageList: 'Manage projects',
  },
  common: {
    epic: 'Epic',
    userStory: 'User story',
    task: 'Task',
    issue: 'Issue',
  },
  admin: {
    menu: {
      members: 'Members',
      permissions: 'Permissions',
    },
    membership: {
      columnMember: 'Member',
      columnAdmin: 'Admin',
      columnRole: 'Role',
      columnStatus: 'Status',
      statusActive: 'Active',
      statusPending: 'Pending',
    },
    roles: {
      pageTitle: 'Roles',
      externalUser: 'External user',
      helpEstimation: 'This role is part of the roles involved in estimating user story points.',
      noteExternal:
        'An external user is any user (logged in to the Taiga platform or not), including search engines. Although unregistered users can never have edit permissions, registered users can, if you allow it. If your project is private, you can also control viewing permissions. Please, use this role with care.',
      warningNoRole:
        'Be careful, no role in your project will be able to estimate the point value for user stories',
    },
    memberships: {
      addButton: 'Add members',
    },
    submenuRoles: {
      actionNewRole: 'New role',
    },
  },
  pagination: {
    previous: 'Prev',
    next: 'Next',
  },
  /**
   * Mirrors `locale-en.json` → `COMMON.PERMISIONS_CATEGORIES` (read-only role matrix).
   */
  permissionLabels: {
    view_project: 'View project',
    add_epic: 'Add epics',
    comment_epic: 'Comment epics',
    delete_epic: 'Delete epics',
    modify_epic: 'Modify epics',
    view_epics: 'View epics',
    add_milestone: 'Add sprints',
    delete_milestone: 'Delete sprints',
    modify_milestone: 'Modify sprints',
    view_milestones: 'View sprints',
    add_us: 'Add user stories',
    comment_us: 'Comment user stories',
    delete_us: 'Delete user stories',
    modify_us: 'Modify user stories',
    view_us: 'View user stories',
    add_task: 'Add tasks',
    comment_task: 'Comment tasks',
    delete_task: 'Delete tasks',
    modify_task: 'Modify tasks',
    view_tasks: 'View tasks',
    add_issue: 'Add issues',
    comment_issue: 'Comment issues',
    delete_issue: 'Delete issues',
    modify_issue: 'Modify issues',
    view_issues: 'View issues',
    add_wiki_link: 'Add wiki links',
    add_wiki_page: 'Add wiki pages',
    delete_wiki_link: 'Delete wiki links',
    delete_wiki_page: 'Delete wiki pages',
    modify_wiki_page: 'Modify wiki pages',
    view_wiki_links: 'View wiki links',
    view_wiki_pages: 'View wiki pages',
  } as Record<string, string>,
} as const;

export type PermissionCategory = {
  id: string;
  label: string;
  keys: readonly string[];
};

/** Mirrors the matrix order in `app/coffee/modules/admin/roles.coffee` (categories). */
export const permissionCategoryOrder: PermissionCategory[] = [
  { id: 'epics', label: 'Epics', keys: ['view_epics', 'add_epic', 'modify_epic', 'comment_epic', 'delete_epic'] },
  { id: 'sprints', label: 'Sprints', keys: ['view_milestones', 'add_milestone', 'modify_milestone', 'delete_milestone'] },
  { id: 'us', label: 'User stories', keys: ['view_us', 'add_us', 'modify_us', 'comment_us', 'delete_us'] },
  { id: 'tasks', label: 'Tasks', keys: ['view_tasks', 'add_task', 'modify_task', 'comment_task', 'delete_task'] },
  { id: 'issues', label: 'Issues', keys: ['view_issues', 'add_issue', 'modify_issue', 'comment_issue', 'delete_issue'] },
  {
    id: 'wiki',
    label: 'Wiki',
    keys: [
      'view_wiki_pages',
      'add_wiki_page',
      'modify_wiki_page',
      'delete_wiki_page',
      'add_wiki_link',
      'delete_wiki_link',
      'view_wiki_links',
    ],
  },
];
