import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.dirname(fileURLToPath(new URL('./ensure-husky.mjs', import.meta.url)));
const huskyDir = path.join(root, '..', '.husky');
const preCommit = path.join(huskyDir, 'pre-commit');

if (!existsSync(huskyDir)) {
  mkdirSync(huskyDir, { recursive: true });
}

if (!existsSync(preCommit)) {
  writeFileSync(
    preCommit,
    `#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
npx lint-staged
`,
    { mode: 0o755 },
  );
}

// Initialize husky when installed (dev dependency)
try {
  execSync('npx husky', { cwd: path.join(root, '..'), stdio: 'ignore' });
} catch {
  // optional in partial installs
}
