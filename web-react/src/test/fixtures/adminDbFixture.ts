/**
 * Test fixtures that mirror the shape of `db.json` / json-server when running the admin
 * API (sample projects, user with admin bit, etc.). No runtime fetch — Vitest and Storybook
 * can import this object.
 */
export const adminApiFixture = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      full_name: 'Admin User',
      is_active: true,
    },
  ],
  userRoles: [
    { id: 1, user: 1, role: 1, project: 1, is_admin: true },
  ],
  projects: [
    {
      id: 1,
      name: 'Sample Scrum',
      slug: 'scrum',
      description: 'Seeded for admin port work.',
    },
  ],
} as const;

export type AdminApiFixture = typeof adminApiFixture;
