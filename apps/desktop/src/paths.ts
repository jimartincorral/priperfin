import { app } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Where everything lives at runtime.
 *
 * User data goes under Electron's per-user data directory:
 *   Windows  %APPDATA%\PriPerFin
 *   macOS    ~/Library/Application Support/PriPerFin
 *
 * The server and the built frontend ship as extraResources, i.e. outside the
 * asar archive, so they are ordinary directories on disk.
 */
export interface AppPaths {
  userData: string;
  dataDir: string;
  backupDir: string;
  logDir: string;
  dbPath: string;
  pidFile: string;
  serverRoot: string;
  clientRoot: string;
  serverEntry: string;
  prismaCli: string;
  schemaPath: string;
}

/**
 * In a packaged app the server tree sits in Contents/Resources (macOS) or
 * resources/ (Windows). In development there is no packaged tree, so
 * PRIPERFIN_RESOURCES_DIR points scripts/dev.mjs at build/server's parent.
 */
function resolveResourcesRoot(): string {
  const override = process.env.PRIPERFIN_RESOURCES_DIR;
  if (override) return path.resolve(override);
  return process.resourcesPath;
}

export function getAppPaths(): AppPaths {
  const userData = app.getPath('userData');
  const resourcesRoot = resolveResourcesRoot();
  const serverRoot = path.join(resourcesRoot, 'server');

  return {
    userData,
    dataDir: path.join(userData, 'data'),
    backupDir: path.join(userData, 'backups'),
    logDir: path.join(userData, 'logs'),
    dbPath: path.join(userData, 'data', 'priperfin.db'),
    pidFile: path.join(userData, 'server.pid'),
    serverRoot,
    clientRoot: path.join(resourcesRoot, 'client'),
    // nest build emits dist/src/main.js rather than dist/main.js: prisma.config.ts
    // sits at the api package root and is picked up by the TypeScript build,
    // which shifts the inferred rootDir. run.sh relies on the same path.
    serverEntry: path.join(serverRoot, 'dist', 'src', 'main.js'),
    prismaCli: path.join(serverRoot, 'node_modules', 'prisma', 'build', 'index.js'),
    schemaPath: path.join('prisma', 'schema.prisma'),
  };
}

export function ensureDirectories(paths: AppPaths): void {
  for (const dir of [paths.dataDir, paths.backupDir, paths.logDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * The environment contract for the API server. Every one of these is load
 * bearing:
 *
 * - HOST=127.0.0.1 keeps the server off the LAN. It stays on
 *   IngressSecurityMiddleware's loopback allow-list and avoids a Windows
 *   Firewall prompt on first launch.
 * - BACKUP_DIR must be set: BackupService defaults it to the container path
 *   /app/backups, mkdir's it in its constructor and throws if that fails,
 *   which would take the whole server down before it listens.
 * - BACKUP_ENCRYPTION_KEY is deleted rather than passed empty: the same
 *   constructor throws unless it is exactly 32 characters, so a stray value
 *   inherited from the user's shell would brick the app.
 * - DATABASE_URL is absolute. PrismaService treats a path containing ':' as
 *   absolute, so a Windows drive letter works, and resolves anything else
 *   against process.cwd().
 */
export function buildServerEnv(paths: AppPaths, port: number): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    NODE_ENV: 'production',
    HOST: '127.0.0.1',
    PORT: String(port),
    DATABASE_URL: `file:${paths.dbPath}`,
    STATIC_PATH: paths.clientRoot,
    BACKUP_DIR: paths.backupDir,
  };
  delete env.BACKUP_ENCRYPTION_KEY;
  return env;
}
