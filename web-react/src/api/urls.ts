// All ~80 Taiga API endpoint paths, ported from resources.coffee

const API_PREFIX = '/api/v1';

function url(path: string): string {
  return `${API_PREFIX}${path}`;
}

function urlWithId(path: string, id: number | string): string {
  return `${API_PREFIX}${path.replace('%s', String(id))}`;
}

export const API_URLS = {
  // Auth
  auth: url('/auth'),
  authRegister: url('/auth/register'),
  invitations: url('/invitations'),
  refresh: url('/auth/refresh'),

  // User
  users: url('/users'),
  byUsername: url('/users/by_username'),
  usersPasswordRecovery: url('/users/password_recovery'),
  usersChangePasswordFromRecovery: url('/users/change_password_from_recovery'),
  usersChangePassword: url('/users/change_password'),
  usersChangeEmail: url('/users/change_email'),
  usersCancelAccount: url('/users/cancel'),
  usersExport: url('/users/export'),
  userStats: (id: number) => urlWithId('/users/%s/stats', id),
  userLiked: (id: number) => urlWithId('/users/%s/liked', id),
  userVoted: (id: number) => urlWithId('/users/%s/voted', id),
  userWatched: (id: number) => urlWithId('/users/%s/watched', id),
  userContacts: (id: number) => urlWithId('/users/%s/contacts', id),
  userMe: url('/users/me'),
  userSendVerificationEmail: url('/users/send_verification_email'),

  // Notifications
  permissions: url('/permissions'),
  notifyPolicies: url('/notify-policies'),
  webNotifications: url('/web-notifications'),

  // User Project Settings
  userProjectSettings: url('/user-project-settings'),

  // User Storage
  userStorage: url('/user-storage'),

  // Memberships
  memberships: url('/memberships'),
  bulkCreateMemberships: url('/memberships/bulk_create'),

  // Roles & Permissions
  roles: url('/roles'),

  // Resolver
  resolver: url('/resolver'),

  // Projects
  projects: url('/projects'),
  projectTemplates: url('/project-templates'),
  projectModules: (id: number) => urlWithId('/projects/%s/modules', id),
  bulkUpdateProjectsOrder: url('/projects/bulk_update_order'),
  projectLike: (id: number) => urlWithId('/projects/%s/like', id),
  projectUnlike: (id: number) => urlWithId('/projects/%s/unlike', id),
  projectWatch: (id: number) => urlWithId('/projects/%s/watch', id),
  projectUnwatch: (id: number) => urlWithId('/projects/%s/unwatch', id),
  projectContact: url('/contact'),
  projectTransferValidateToken: (id: number) => urlWithId('/projects/%s/transfer_validate_token', id),
  projectTransferAccept: (id: number) => urlWithId('/projects/%s/transfer_accept', id),
  projectTransferReject: (id: number) => urlWithId('/projects/%s/transfer_reject', id),
  projectTransferRequest: (id: number) => urlWithId('/projects/%s/transfer_request', id),
  projectTransferStart: (id: number) => urlWithId('/projects/%s/transfer_start', id),

  // Project Values - Attributes
  epicStatuses: url('/epic-statuses'),
  userstoryStatuses: url('/userstory-statuses'),
  userstoryDueDates: url('/userstory-due-dates'),
  userstoryDueDatesCreateDefault: url('/userstory-due-dates/create_default'),
  points: url('/points'),
  taskStatuses: url('/task-statuses'),
  taskDueDates: url('/task-due-dates'),
  taskDueDatesCreateDefault: url('/task-due-dates/create_default'),
  issueStatuses: url('/issue-statuses'),
  issueDueDates: url('/issue-due-dates'),
  issueDueDatesCreateDefault: url('/issue-due-dates/create_default'),
  issueTypes: url('/issue-types'),
  priorities: url('/priorities'),
  severities: url('/severities'),

  // Milestones / Sprints
  milestones: url('/milestones'),
  moveUserstoriesToMilestone: (id: number) => urlWithId('/milestones/%s/move_userstories_to_sprint', id),
  moveTasksToMilestone: (id: number) => urlWithId('/milestones/%s/move_tasks_to_sprint', id),
  moveIssuesToMilestone: (id: number) => urlWithId('/milestones/%s/move_issues_to_sprint', id),

  // Epics
  epics: url('/epics'),
  epicUpvote: (id: number) => urlWithId('/epics/%s/upvote', id),
  epicDownvote: (id: number) => urlWithId('/epics/%s/downvote', id),
  epicWatch: (id: number) => urlWithId('/epics/%s/watch', id),
  epicUnwatch: (id: number) => urlWithId('/epics/%s/unwatch', id),
  epicRelatedUserstories: (id: number) => urlWithId('/epics/%s/related_userstories', id),
  epicRelatedUserstoriesBulkCreate: (id: number) => urlWithId('/epics/%s/related_userstories/bulk_create', id),

  // User Stories
  userstories: url('/userstories'),
  bulkCreateUs: url('/userstories/bulk_create'),
  bulkUpdateUsBacklogOrder: url('/userstories/bulk_update_backlog_order'),
  bulkUpdateUsMilestone: url('/userstories/bulk_update_milestone'),
  bulkUpdateUsMilesOrder: url('/userstories/bulk_update_sprint_order'),
  bulkUpdateUsKanbanOrder: url('/userstories/bulk_update_kanban_order'),
  userstoriesFilters: url('/userstories/filters_data'),
  userstoryUpvote: (id: number) => urlWithId('/userstories/%s/upvote', id),
  userstoryDownvote: (id: number) => urlWithId('/userstories/%s/downvote', id),
  userstoryWatch: (id: number) => urlWithId('/userstories/%s/watch', id),
  userstoryUnwatch: (id: number) => urlWithId('/userstories/%s/unwatch', id),

  // Tasks
  tasks: url('/tasks'),
  bulkCreateTasks: url('/tasks/bulk_create'),
  bulkUpdateTaskTaskboardOrder: url('/tasks/bulk_update_taskboard_order'),
  bulkUpdateTaskMilestone: url('/tasks/bulk_update_milestone'),
  taskUpvote: (id: number) => urlWithId('/tasks/%s/upvote', id),
  taskDownvote: (id: number) => urlWithId('/tasks/%s/downvote', id),
  taskWatch: (id: number) => urlWithId('/tasks/%s/watch', id),
  taskUnwatch: (id: number) => urlWithId('/tasks/%s/unwatch', id),
  taskFilters: url('/tasks/filters_data'),
  promoteTaskToUs: (id: number) => urlWithId('/tasks/%s/promote_to_user_story', id),

  // Issues
  issues: url('/issues'),
  bulkCreateIssues: url('/issues/bulk_create'),
  bulkUpdateIssueMilestone: url('/issues/bulk_update_milestone'),
  issuesFilters: url('/issues/filters_data'),
  issueUpvote: (id: number) => urlWithId('/issues/%s/upvote', id),
  issueDownvote: (id: number) => urlWithId('/issues/%s/downvote', id),
  issueWatch: (id: number) => urlWithId('/issues/%s/watch', id),
  issueUnwatch: (id: number) => urlWithId('/issues/%s/unwatch', id),
  promoteIssueToUs: (id: number) => urlWithId('/issues/%s/promote_to_user_story', id),

  // Swimlanes
  swimlanes: url('/swimlanes'),
  swimlaneUserstoryStatuses: url('/swimlane-userstory-statuses'),

  // Wiki
  wiki: url('/wiki'),
  wikiRestore: (id: number) => urlWithId('/wiki/%s/restore', id),
  wikiLinks: url('/wiki-links'),

  // History
  historyEpic: url('/history/epic'),
  historyUs: url('/history/userstory'),
  historyIssue: url('/history/issue'),
  historyTask: url('/history/task'),
  historyWiki: url('/history/wiki'),

  // Attachments
  attachmentsEpic: url('/epics/attachments'),
  attachmentsUs: url('/userstories/attachments'),
  attachmentsIssue: url('/issues/attachments'),
  attachmentsTask: url('/tasks/attachments'),
  attachmentsWiki: url('/wiki/attachments'),

  // Custom Attributes
  customAttributesEpic: url('/epic-custom-attributes'),
  customAttributesUserstory: url('/userstory-custom-attributes'),
  customAttributesTask: url('/task-custom-attributes'),
  customAttributesIssue: url('/issue-custom-attributes'),

  // Custom Attributes Values
  customAttributesValuesEpic: url('/epics/custom-attributes-values'),
  customAttributesValuesUserstory: url('/userstories/custom-attributes-values'),
  customAttributesValuesTask: url('/tasks/custom-attributes-values'),
  customAttributesValuesIssue: url('/issues/custom-attributes-values'),

  // Webhooks
  webhooks: url('/webhooks'),
  webhooksTest: (id: number) => urlWithId('/webhooks/%s/test', id),
  webhooklogs: url('/webhooklogs'),
  webhooklogsResend: (id: number) => urlWithId('/webhooklogs/%s/resend', id),

  // Reports - CSV
  epicsCsv: (uuid: string) => url(`/epics/csv?uuid=${uuid}`),
  userstoriesCsv: (uuid: string) => url(`/userstories/csv?uuid=${uuid}`),
  tasksCsv: (uuid: string) => url(`/tasks/csv?uuid=${uuid}`),
  issuesCsv: (uuid: string) => url(`/issues/csv?uuid=${uuid}`),

  // Timeline
  timelineProfile: url('/timeline/profile'),
  timelineUser: url('/timeline/user'),
  timelineProject: url('/timeline/project'),

  // Search
  search: url('/search'),

  // Export/Import
  exporter: url('/exporter'),
  importer: url('/importer/load_dump'),

  // Feedback
  feedback: url('/feedback'),

  // Locales
  locales: url('/locales'),

  // Application tokens
  applications: url('/applications'),
  applicationTokens: url('/application-tokens'),

  // Stats
  statsDiscover: url('/stats/discover'),

  // Importers
  importersTrelloAuthUrl: url('/importers/trello/auth_url'),
  importersTrelloAuthorize: url('/importers/trello/authorize'),
  importersTrelloListProjects: url('/importers/trello/list_projects'),
  importersTrelloListUsers: url('/importers/trello/list_users'),
  importersTrelloImportProject: url('/importers/trello/import_project'),

  importersJiraAuthUrl: url('/importers/jira/auth_url'),
  importersJiraAuthorize: url('/importers/jira/authorize'),
  importersJiraListProjects: url('/importers/jira/list_projects'),
  importersJiraListUsers: url('/importers/jira/list_users'),
  importersJiraImportProject: url('/importers/jira/import_project'),

  importersGithubAuthUrl: url('/importers/github/auth_url'),
  importersGithubAuthorize: url('/importers/github/authorize'),
  importersGithubListProjects: url('/importers/github/list_projects'),
  importersGithubListUsers: url('/importers/github/list_users'),
  importersGithubImportProject: url('/importers/github/import_project'),

  importersAsanaAuthUrl: url('/importers/asana/auth_url'),
  importersAsanaAuthorize: url('/importers/asana/authorize'),
  importersAsanaListProjects: url('/importers/asana/list_projects'),
  importersAsanaListUsers: url('/importers/asana/list_users'),
  importersAsanaImportProject: url('/importers/asana/import_project'),
} as const;
