import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import { AppPaths } from './paths';
import { log } from './logger';

const DB_PUSH_TIMEOUT_MS = 120_000;

export class SchemaSyncError extends Error {
  constructor(
    message: string,
    readonly output: string,
  ) {
    super(message);
    this.name = 'SchemaSyncError';
  }
}

/**
 * Create or update the SQLite schema before the server starts.
 *
 * PriPerFin's API validates the schema but never creates it: PrismaService
 * throws "Database schema is out of sync" when a table or column is missing.
 * In the Home Assistant add-on, run.sh covers this by running `prisma db push`
 * from the container entrypoint. The desktop app ships the same CLI and runs
 * the same command, so there is one schema path to reason about.
 *
 * One deliberate difference from run.sh: no --accept-data-loss. If a schema
 * change would drop data, db push refuses and we surface that to the user
 * rather than silently discarding columns from their financial records.
 */
export async function pushSchema(paths: AppPaths): Promise<void> {
  if (!fs.existsSync(paths.prismaCli)) {
    throw new SchemaSyncError(
      'The application files are incomplete.',
      `Prisma CLI not found at ${paths.prismaCli}`,
    );
  }

  log(`Synchronising database schema at ${paths.dbPath}`);

  const output = await run(paths);
  log('Database schema is up to date');
  if (output.trim()) log(output.trim());
}

function run(paths: AppPaths): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [paths.prismaCli, 'db', 'push', `--schema=${paths.schemaPath}`],
      {
        cwd: paths.serverRoot,
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          NODE_ENV: 'production',
          DATABASE_URL: `file:${paths.dbPath}`,
          // Prisma's CLI emits ANSI colour codes by default; they would end up
          // verbatim in an error dialog.
          NO_COLOR: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    );

    let output = '';
    const capture = (buffer: Buffer) => {
      output += buffer.toString();
    };
    child.stdout?.on('data', capture);
    child.stderr?.on('data', capture);

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {
        // Already gone.
      }
      reject(new SchemaSyncError('Preparing the database timed out.', output));
    }, DB_PUSH_TIMEOUT_MS);

    child.once('error', (error) => {
      clearTimeout(timer);
      reject(new SchemaSyncError('Could not run the database setup step.', `${error.message}\n${output}`));
    });

    child.once('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(output);
      } else {
        reject(new SchemaSyncError(describeFailure(output), output));
      }
    });
  });
}

function describeFailure(output: string): string {
  if (/data loss|would.*lose|not empty/i.test(output)) {
    return 'The database could not be updated automatically because the change would discard existing data.';
  }
  if (/SQLITE_BUSY|database is locked/i.test(output)) {
    return 'The database is locked. Another copy of PriPerFin may still be running.';
  }
  if (/SQLITE_CANTOPEN|unable to open database/i.test(output)) {
    return 'The database file could not be opened. Check that the data folder is writable.';
  }
  return 'The database could not be prepared.';
}
