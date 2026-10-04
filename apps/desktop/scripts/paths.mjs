import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const desktopDir = path.resolve(scriptsDir, '..');
export const repoRoot = path.resolve(desktopDir, '..', '..');
export const apiDir = path.join(repoRoot, 'apps', 'api');
export const webDir = path.join(repoRoot, 'apps', 'web');
export const stageDir = path.join(desktopDir, 'build', 'server');
