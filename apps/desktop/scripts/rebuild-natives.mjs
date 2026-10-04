import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import * as path from 'node:path';
import { rebuild } from '@electron/rebuild';
import { stageDir } from './paths.mjs';

/**
 * Rebuild the staged tree's native modules against Electron's ABI.
 *
 * electron-builder's own npmRebuild only covers this package's node_modules,
 * never an extraResources tree, so relying on it would silently ship a
 * better_sqlite3.node built for stock Node. The symptom is a cryptic
 * NODE_MODULE_VERSION error on first launch, not a build failure — which is
 * exactly why npmRebuild is set to false in electron-builder.yml.
 */

if (!existsSync(stageDir)) {
  console.error('[rebuild] build/server does not exist. Run scripts/stage-server.mjs first.');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const electronVersion = require('electron/package.json').version;
const arch = process.env.TARGET_ARCH || process.arch;

console.log(`[rebuild] Rebuilding native modules for Electron ${electronVersion} (${arch})`);

// Never reuse a prebuilt binary compiled for stock Node's ABI.
process.env.npm_config_build_from_source = 'true';

await rebuild({
  buildPath: stageDir,
  electronVersion,
  arch,
  onlyModules: ['better-sqlite3', 'bcrypt'],
  force: true,
});

// The packaged app drops each module's prebuilds/ directory, because
// node-gyp-build checks build/Release first and a stock-Node prebuilt would
// otherwise be a loaded-at-runtime ABI mismatch waiting to happen. That makes
// build/Release/*.node mandatory: assert it rather than discover it on a user's
// machine.
for (const moduleName of ['better-sqlite3', 'bcrypt']) {
  const releaseDir = path.join(stageDir, 'node_modules', moduleName, 'build', 'Release');
  const binaries = existsSync(releaseDir)
    ? readdirSync(releaseDir).filter((file) => file.endsWith('.node'))
    : [];
  if (binaries.length === 0) {
    console.error(`[rebuild] ERROR: ${moduleName} has no build/Release/*.node after rebuilding.`);
    console.error('[rebuild] Packaging would produce an app that cannot start.');
    process.exit(1);
  }
  console.log(`[rebuild] ${moduleName}: ${binaries.join(', ')}`);
}

console.log('[rebuild] Native modules rebuilt');
