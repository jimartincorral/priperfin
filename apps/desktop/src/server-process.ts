import { ChildProcess, spawn, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import { AddressInfo, createServer } from 'node:net';
import * as path from 'node:path';
import { AppPaths, buildServerEnv } from './paths';
import { log, logError, rotateIfLarge } from './logger';

const HEALTH_TIMEOUT_MS = 45_000;
const HEALTH_INTERVAL_MS = 250;
const SHUTDOWN_GRACE_MS = 3_000;
const MAX_PORT_ATTEMPTS = 5;
const TAIL_LINES = 80;

export interface ServerHandle {
  port: number;
  url: string;
  child: ChildProcess;
  /** Most recent stdout/stderr output, for crash reporting. */
  tail(): string;
}

/** A failure to reach a listening, healthy server. Carries the output tail. */
export class ServerStartError extends Error {
  constructor(
    message: string,
    readonly output: string,
  ) {
    super(message);
    this.name = 'ServerStartError';
  }
}

/**
 * Ask the OS for a free loopback port.
 *
 * There is an unavoidable gap between closing this probe socket and the server
 * child binding the port. startServer() handles the resulting EADDRINUSE by
 * probing again.
 */
export function probeFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address() as AddressInfo;
      probe.close(() => resolve(port));
    });
  });
}

/**
 * Kill a server left behind by a previous run.
 *
 * Electron cannot put its children in a job object, so a hard kill of the app
 * (Task Manager "End task", a crash) orphans the server. An orphan keeps the
 * SQLite WAL lock, and the next launch then fails with SQLITE_BUSY after the
 * 5s busy_timeout, which looks like an unexplained hang.
 */
export function reapStalePid(pidFile: string): void {
  let pid = 0;
  try {
    pid = Number(fs.readFileSync(pidFile, 'utf8').trim());
  } catch {
    return;
  }

  if (!pid || !Number.isInteger(pid)) {
    fs.rmSync(pidFile, { force: true });
    return;
  }

  try {
    process.kill(pid, 0); // throws if the process is gone
    log(`Reaping orphaned server process ${pid} from a previous run`);
    killPid(pid);
  } catch {
    // Already gone.
  } finally {
    fs.rmSync(pidFile, { force: true });
  }
}

function killPid(pid: number): void {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true });
  } else {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // Raced with normal exit.
    }
  }
}

export interface StartServerOptions {
  paths: AppPaths;
  onCrash: (code: number | null, output: string) => void;
}

/**
 * Start the API server and resolve once it answers /health.
 *
 * The server runs as a child process rather than inside the Electron main
 * process. Several constructors in the API throw during boot (PrismaService's
 * schema validation, BackupService's directory and key checks); in-process
 * those would take down Electron itself mid-startup and leave the user with a
 * window that never appears. Out-of-process we get an exit code and the
 * captured output, and can show a real error dialog.
 *
 * process.execPath with ELECTRON_RUN_AS_NODE=1 runs Electron's own binary as
 * plain Node, so there is no second runtime to ship and the native modules
 * only need to be built for one ABI.
 */
export async function startServer(options: StartServerOptions): Promise<ServerHandle> {
  const { paths } = options;

  if (!fs.existsSync(paths.serverEntry)) {
    throw new ServerStartError(
      'The application files are incomplete.',
      `Server entry point not found at ${paths.serverEntry}`,
    );
  }

  let lastOutput = '';
  for (let attempt = 1; attempt <= MAX_PORT_ATTEMPTS; attempt++) {
    const port = await probeFreePort();
    const result = await trySpawn(options, port);

    if (result.handle) return result.handle;

    lastOutput = result.output;
    if (!result.portTaken) {
      throw new ServerStartError('The PriPerFin server did not start.', result.output);
    }
    log(`Port ${port} was taken before the server could bind it; retrying (${attempt}/${MAX_PORT_ATTEMPTS})`);
  }

  throw new ServerStartError(
    `Could not find a free port after ${MAX_PORT_ATTEMPTS} attempts.`,
    lastOutput,
  );
}

interface SpawnAttempt {
  handle?: ServerHandle;
  output: string;
  portTaken: boolean;
}

async function trySpawn(options: StartServerOptions, port: number): Promise<SpawnAttempt> {
  const { paths, onCrash } = options;

  const serverLogPath = path.join(paths.logDir, 'server.log');
  rotateIfLarge(serverLogPath);
  const logStream = fs.createWriteStream(serverLogPath, { flags: 'a' });
  logStream.write(`\n=== ${new Date().toISOString()} starting on 127.0.0.1:${port} ===\n`);

  const child = spawn(process.execPath, [paths.serverEntry], {
    cwd: paths.serverRoot,
    env: buildServerEnv(paths, port),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  if (child.pid) {
    try {
      fs.writeFileSync(paths.pidFile, String(child.pid), 'utf8');
    } catch (error) {
      logError('Could not write the server pid file', error);
    }
  }

  const lines: string[] = [];
  const capture = (buffer: Buffer) => {
    const text = buffer.toString();
    logStream.write(text);
    lines.push(text);
    if (lines.length > TAIL_LINES) lines.shift();
  };
  const tail = () => lines.join('');
  child.stdout?.on('data', capture);
  child.stderr?.on('data', capture);

  let exitCode: number | null | undefined;
  let exited = false;
  child.once('exit', (code) => {
    exited = true;
    exitCode = code;
    fs.rmSync(paths.pidFile, { force: true });
  });
  child.once('error', (error) => {
    exited = true;
    capture(Buffer.from(`Failed to spawn server: ${error.message}\n`));
  });

  const url = `http://127.0.0.1:${port}`;
  const healthy = await waitForHealth(url, () => exited);

  if (!healthy) {
    const output = tail();
    if (exited && /EADDRINUSE/.test(output)) {
      return { output, portTaken: true };
    }
    if (!exited) {
      try {
        child.kill();
      } catch {
        // Already dying.
      }
    }
    return {
      output: output || `The server exited with code ${exitCode ?? 'unknown'} before becoming ready.`,
      portTaken: false,
    };
  }

  log(`Server is ready on ${url}`);

  // Past this point an exit is a crash, not a failed boot.
  child.once('exit', (code) => onCrash(code, tail()));

  return { handle: { port, url, child, tail }, output: '', portTaken: false };
}

/**
 * Poll GET /health rather than GET /.
 *
 * "/" is handled by the SPA catch-all, which just reads index.html off disk and
 * would answer even with the database broken. /health only responds once Nest
 * has fully initialised, which means PrismaService.onModuleInit() and its
 * schema validation have already passed.
 */
async function waitForHealth(baseUrl: string, hasExited: () => boolean): Promise<boolean> {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (hasExited()) return false;
    try {
      const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(1_500) });
      if (response.ok) {
        const body = (await response.json()) as { status?: string } | null;
        if (body?.status === 'ok') return true;
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, HEALTH_INTERVAL_MS));
  }

  return false;
}

/**
 * Stop the server, escalating to a forced kill if it does not exit promptly.
 * Because we spawn process.execPath directly (no shell), the direct child is
 * the server itself, so kill() reaches it.
 */
export function stopServer(handle: ServerHandle, pidFile: string): Promise<void> {
  return new Promise((resolve) => {
    const { child } = handle;
    if (child.exitCode !== null || child.signalCode !== null) {
      fs.rmSync(pidFile, { force: true });
      resolve();
      return;
    }

    const finish = () => {
      clearTimeout(timer);
      fs.rmSync(pidFile, { force: true });
      resolve();
    };

    const timer = setTimeout(() => {
      log('Server did not exit within the grace period; forcing it down');
      if (child.pid) killPid(child.pid);
      finish();
    }, SHUTDOWN_GRACE_MS);

    child.once('exit', finish);
    try {
      child.kill('SIGTERM');
    } catch {
      if (child.pid) killPid(child.pid);
      finish();
    }
  });
}
