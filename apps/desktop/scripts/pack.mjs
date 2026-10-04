import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import { desktopDir, scriptsDir } from './paths.mjs';
import { readVersion } from './version.mjs';

/**
 * stage -> rebuild natives -> compile the Electron shell -> electron-builder.
 *
 * Usage: node scripts/pack.mjs --win | --mac | --dir [extra electron-builder args]
 */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('[pack] Expected a target, e.g. --win, --mac or --dir');
  process.exit(1);
}

const version = readVersion();
const isWindows = process.platform === 'win32';

function run(command, commandArgs) {
  console.log(`[pack] ${command} ${commandArgs.join(' ')}`);
  execFileSync(command, commandArgs, { cwd: desktopDir, stdio: 'inherit', shell: isWindows });
}

run('node', [path.join(scriptsDir, 'stage-server.mjs')]);
run('node', [path.join(scriptsDir, 'rebuild-natives.mjs')]);
run('npx', ['tsc', '-p', 'tsconfig.main.json']);

console.log(`[pack] Packaging PriPerFin ${version}`);
run('npx', [
  'electron-builder',
  ...args,
  // The version comes from config.yaml rather than package.json, so there is
  // no second source of truth and no dirty git tree during packaging.
  `--config.extraMetadata.version=${version}`,
  // Load bearing: electron-builder's GitHub publisher creates a DRAFT release,
  // which Home Assistant cannot see. CI attaches assets with `gh release
  // upload` to the release the workflow already published.
  '--publish',
  'never',
]);

console.log(`[pack] Done. Artifacts are in ${path.join(desktopDir, 'release')}`);
