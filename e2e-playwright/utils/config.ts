// Shared test configuration
// The admin password depends on how the backend was seeded:
// - taiga-seed.mjs sets it to 'adminpass'
// - sample_data (without taiga-seed) uses '123123'
// We try both in order during global setup, but for explicit tests
// we use an env var with a default.
export const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'adminpass';
export const ADMIN_PASSWORD_ALT = '123123';
