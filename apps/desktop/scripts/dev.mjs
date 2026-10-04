import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { desktopDir, stageDir, webDir } from './paths.mjs';
import { readVersion } from './version.mjs';

/**
 * Run the desktop app locally.
 *
 *   pnpm -F desktop dev
 *
 * It runs against build/server rather than apps/api directly, because the
 * native modules in apps/api/node_modules are built for stock Node, not for
 * Electron's ABI — the main process could not load better-sqlite3 from there.
 * Running against the staged tree also means dev exercises the packaging path.
 *
 * First time (or after changing the API):
 *   pnpm -F api build && pnpm -F web build
 *   pnpm -F desktop stage && pnpm -F desktop rebuild:natives
 */

if (!existsSync(stageDir)) {
  console.error('[dev] build/server is missing.');
  console.error('[dev] Run: pnpm -F api build && pnpm -F web build');
  console.error('[dev]      pnpm -F desktop stage && pnpm -F desktop rebuild:natives');
  process.exit(1);
}

if (!existsSync(path.join(webDir, 'dist'))) {
  console.error('[dev] apps/web/dist is missing. Run: pnpm -F web build');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const electron = require('electron');

// getAppPaths() reads PRIPERFIN_RESOURCES_DIR instead of process.resourcesPath
// when it is set. Point it at a directory holding server/ and client/.
const resourcesDir = path.join(desktopDir, 'build', 'dev-resources');

const child = spawn(electron, [desktopDir], {
  cwd: desktopDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PRIPERFIN_RESOURCES_DIR: resourcesDir,
    PRIPERFIN_VERSION: readVersion(),
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
