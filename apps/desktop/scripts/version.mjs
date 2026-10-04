import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { repoRoot } from './paths.mjs';

/**
 * config.yaml is the single source of truth for the version across the whole
 * project (the Home Assistant add-on image tag, the git tag and the GitHub
 * release all derive from it). The desktop package.json is committed as 0.0.0
 * and stamped at package time so it cannot drift.
 */
export function readVersion() {
  const configPath = path.join(repoRoot, 'config.yaml');
  const contents = readFileSync(configPath, 'utf8');
  const match = contents.match(/^version:\s*"?([^"\s]+)"?/m);
  if (!match) throw new Error(`Could not read version from ${configPath}`);
  return match[1];
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.stdout.write(readVersion());
}
