import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharedIndex = path.join(root, 'packages/shared/src/index.ts');
const metroConfig = path.join(root, 'app-rn/metro.config.js');

const checks = [
  ['packages/shared/src/index.ts', fs.existsSync(sharedIndex)],
  ['app-rn/metro.config.js', fs.existsSync(metroConfig)],
  ['@vault-track/shared in app-rn package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'app-rn/package.json'), 'utf8'));
    return pkg.dependencies?.['@vault-track/shared'] !== undefined;
  }],
];

let failed = false;
for (const [label, result] of checks) {
  const ok = typeof result === 'function' ? result() : result;
  console.log(ok ? `✓ ${label}` : `✗ ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('\nShared package wiring verified.');
