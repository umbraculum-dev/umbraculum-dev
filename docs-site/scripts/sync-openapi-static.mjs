/**
 * Sync committed OpenAPI JSON from services/api/openapi/ to docs-site/static/openapi/.
 * Run from docs-site prebuild; no-op when sources are missing (CI partial checkout).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const sourceDir = path.join(repoRoot, 'services/api/openapi');
const targetDir = path.join(repoRoot, 'docs-site/static/openapi');

const files = ['openapi.json', 'brewery.json'];

if (!fs.existsSync(sourceDir)) {
  console.warn('sync-openapi-static: skip — services/api/openapi/ not found');
  process.exit(0);
}

fs.mkdirSync(targetDir, {recursive: true});

for (const name of files) {
  const source = path.join(sourceDir, name);
  const target = path.join(targetDir, name);
  if (!fs.existsSync(source)) {
    console.warn(`sync-openapi-static: skip — missing ${source}`);
    continue;
  }
  fs.copyFileSync(source, target);
  console.log(`sync-openapi-static: ${name}`);
}
