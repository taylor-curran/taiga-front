#!/usr/bin/env node
/**
 * Taiga Front uses AngularJS + Gulp, not @angular/cli.
 * This shim maps `ng build` → `npx gulp deploy` so `npx ng build` matches the reference build.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const argv = process.argv.slice(2);
const cmd = argv[0];

if (cmd !== 'build') {
  console.error('This repository only wires `ng build` to the Gulp reference build.');
  console.error('Usage: ng build');
  process.exit(1);
}

const root = path.resolve(__dirname, '..', '..', '..');
const result = spawnSync('npx', ['gulp', 'deploy'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
