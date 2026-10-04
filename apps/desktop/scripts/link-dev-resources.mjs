import { mkdirSync, rmSync, symlinkSync } from 'node:fs';
import * as path from 'node:path';
import { desktopDir, stageDir, webDir } from './paths.mjs';

/**
 * Build build/dev-resources: the same server/ + client/ layout the packaged app
 * gets from extraResources, so dev mode and production resolve paths identically.
 */
const devResources = path.join(desktopDir, 'build', 'dev-resources');
rmSync(devResources, { recursive: true, force: true });
mkdirSync(devResources, { recursive: true });

const type = process.platform === 'win32' ? 'junction' : 'dir';
symlinkSync(stageDir, path.join(devResources, 'server'), type);
symlinkSync(path.join(webDir, 'dist'), path.join(devResources, 'client'), type);

console.log(`[dev] Linked ${devResources}`);
