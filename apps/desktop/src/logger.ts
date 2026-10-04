import * as fs from 'node:fs';
import * as path from 'node:path';

const MAX_LOG_BYTES = 5 * 1024 * 1024;

let mainLogStream: fs.WriteStream | null = null;
let mainLogPath = '';

/**
 * Rotate a log that has grown past MAX_LOG_BYTES, keeping one previous
 * generation. The API logs every static asset request including the full
 * header JSON, so server.log grows quickly during a long session.
 */
export function rotateIfLarge(filePath: string): void {
  try {
    const { size } = fs.statSync(filePath);
    if (size < MAX_LOG_BYTES) return;
    fs.rmSync(`${filePath}.1`, { force: true });
    fs.renameSync(filePath, `${filePath}.1`);
  } catch {
    // Missing file, or a rename refused because something still holds it open.
    // Neither is worth failing startup over.
  }
}

export function initLogger(logDir: string): void {
  fs.mkdirSync(logDir, { recursive: true });
  mainLogPath = path.join(logDir, 'main.log');
  rotateIfLarge(mainLogPath);
  mainLogStream = fs.createWriteStream(mainLogPath, { flags: 'a' });
  log(`--- PriPerFin desktop started ${new Date().toISOString()} ---`);
}

export function log(message: string): void {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  process.stdout.write(line);
  mainLogStream?.write(line);
}

export function logError(message: string, error?: unknown): void {
  const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error ?? '');
  log(`ERROR ${message}${detail ? `\n${detail}` : ''}`);
}

export function getMainLogPath(): string {
  return mainLogPath;
}
