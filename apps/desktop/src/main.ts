import { app, BrowserWindow, dialog, shell } from 'electron';
import { Menu } from 'electron';
import * as path from 'node:path';
import { pushSchema, SchemaSyncError } from './db-push';
import { getMainLogPath, initLogger, log, logError } from './logger';
import { buildMenu, focusWindow } from './menu';
import { AppPaths, ensureDirectories, getAppPaths } from './paths';
import {
  reapStalePid,
  ServerHandle,
  ServerStartError,
  startServer,
  stopServer,
} from './server-process';
import { loadWindowState, MIN_HEIGHT, MIN_WIDTH, trackWindow } from './window-state';

// A second instance would fight the first over the SQLite database.
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let paths: AppPaths;
let mainWindow: BrowserWindow | null = null;
let server: ServerHandle | null = null;
let isQuitting = false;
let shutdownStarted = false;

app.on('second-instance', () => focusWindow(mainWindow));

app.whenReady().then(bootstrap).catch((error) => {
  logError('Unexpected failure during startup', error);
  showFatal('PriPerFin could not start.', String(error));
});

async function bootstrap(): Promise<void> {
  paths = getAppPaths();
  ensureDirectories(paths);
  initLogger(paths.logDir);
  process.env.PRIPERFIN_VERSION = app.getVersion();

  Menu.setApplicationMenu(buildMenu({ paths, getServerUrl: () => server?.url }));
  createWindow();

  // Show something immediately: the server takes a few seconds to come up, and
  // an empty frame reads as a hang.
  await mainWindow!.loadFile(path.join(__dirname, '..', 'static', 'loading.html'));

  try {
    preflightNativeModules();

    reapStalePid(paths.pidFile);

    setStatus('Preparing database…');
    await pushSchema(paths);

    setStatus('Starting server…');
    server = await startServer({ paths, onCrash: handleServerCrash });

    // Rebuild the menu so "Open in Browser" picks up the server URL.
    Menu.setApplicationMenu(buildMenu({ paths, getServerUrl: () => server?.url }));

    await mainWindow!.loadURL(server.url);
    log('Application window loaded');
  } catch (error) {
    logError('Startup failed', error);
    const { message, detail } = explain(error);
    showFatal(message, detail);
  }
}

function createWindow(): void {
  const state = loadWindowState(paths.userData);

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    backgroundColor: '#11161c',
    title: 'PriPerFin',
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  trackWindow(mainWindow, paths.userData);
  if (state.isMaximized) mainWindow.maximize();
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Anything outside our own origin belongs in the user's real browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = server && url.startsWith(server.url);
    if (allowed || url.startsWith('file://')) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) void shell.openExternal(url);
  });
}

/** Update the splash text, if the splash is still the loaded document. */
function setStatus(text: string): void {
  log(text);
  const payload = JSON.stringify(text);
  mainWindow?.webContents
    .executeJavaScript(`window.setStartupStatus && window.setStartupStatus(${payload});`, true)
    .catch(() => {
      // The splash may already have been replaced; not worth reporting.
    });
}

/**
 * better-sqlite3 and bcrypt are compiled against Electron's ABI at package
 * time. A mismatch produces a cryptic NODE_MODULE_VERSION error deep inside
 * the server child; catching it here turns it into something actionable.
 */
function preflightNativeModules(): void {
  const modulePath = path.join(paths.serverRoot, 'node_modules', 'better-sqlite3');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(modulePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/NODE_MODULE_VERSION|was compiled against a different/i.test(message)) {
      throw new ServerStartError(
        'This build of PriPerFin was packaged incorrectly and cannot run.',
        `${message}\n\nThe bundled native modules were not rebuilt for Electron ${process.versions.electron}.`,
      );
    }
    throw new ServerStartError('A required component could not be loaded.', message);
  }
}

function handleServerCrash(code: number | null, output: string): void {
  if (isQuitting || shutdownStarted) return;
  logError(`Server exited unexpectedly with code ${code}`);
  server = null;
  showFatal(
    'The PriPerFin server stopped unexpectedly.',
    `Exit code: ${code ?? 'unknown'}\n\n${output.slice(-2000)}`,
  );
}

/** Turn an internal error into something a person without a terminal can act on. */
function explain(error: unknown): { message: string; detail: string } {
  if (error instanceof SchemaSyncError) {
    return { message: error.message, detail: `${error.output.slice(-2000)}\n\nDatabase: ${paths.dbPath}` };
  }

  if (error instanceof ServerStartError) {
    const output = error.output ?? '';

    // PrismaService tells the user to run `npx prisma db push`. That is correct
    // advice inside the add-on container and useless on a desktop, so replace it.
    if (/schema is out of sync|no such table|no such column/i.test(output)) {
      return {
        message: 'PriPerFin could not open its database.',
        detail:
          'The database file does not match this version of the app.\n\n' +
          `Database: ${paths.dbPath}\n` +
          `Backups: ${paths.backupDir}\n\n` +
          'If you recently installed an older version, reinstall the newer one. ' +
          'Otherwise you can restore a backup from the backups folder.',
      };
    }

    if (/SQLITE_BUSY|database is locked/i.test(output)) {
      return {
        message: 'The database is in use.',
        detail:
          'Another copy of PriPerFin may still be running. Close it, or sign out and back in, then try again.\n\n' +
          `Database: ${paths.dbPath}`,
      };
    }

    return { message: error.message, detail: output.slice(-2000) };
  }

  const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
  return { message: 'PriPerFin could not start.', detail };
}

/**
 * Report a fatal problem in the window and in a dialog, then quit. Never leave
 * the user looking at a blank frame.
 */
function showFatal(message: string, detail: string): void {
  const logPath = getMainLogPath();

  if (mainWindow && !mainWindow.isDestroyed()) {
    const payload = encodeURIComponent(JSON.stringify({ message, detail }));
    void mainWindow.loadFile(path.join(__dirname, '..', 'static', 'error.html'), { hash: payload });
    mainWindow.show();
  }

  const choice = dialog.showMessageBoxSync({
    type: 'error',
    title: 'PriPerFin',
    message,
    detail: `${detail}\n\nLog file: ${logPath}`,
    buttons: ['Open Logs', 'Open Data Folder', 'Quit'],
    defaultId: 2,
    cancelId: 2,
    noLink: true,
  });

  if (choice === 0) void shell.openPath(paths.logDir);
  if (choice === 1) void shell.openPath(paths.userData);

  isQuitting = true;
  app.exit(1);
}

app.on('window-all-closed', () => {
  // Standard macOS apps stay resident; everywhere else, closing the window quits.
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow) {
    focusWindow(mainWindow);
    return;
  }
  if (server) {
    createWindow();
    void mainWindow!.loadURL(server.url);
  }
});

app.on('before-quit', (event) => {
  if (shutdownStarted || !server) return;
  shutdownStarted = true;
  isQuitting = true;
  event.preventDefault();
  log('Shutting down the server');
  void stopServer(server, paths.pidFile).then(() => {
    server = null;
    app.quit();
  });
});

// Last-ditch synchronous reaper for an abrupt exit.
process.on('exit', () => {
  try {
    server?.child.kill('SIGKILL');
  } catch {
    // Nothing more we can do at this point.
  }
});
