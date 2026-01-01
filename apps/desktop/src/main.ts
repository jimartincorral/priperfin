import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let apiProcess: childProcess.ChildProcess | null = null;

const isDev = !app.isPackaged;
const API_PORT = 3000; // Could be dynamic
const WIN_URL = isDev
  ? 'http://localhost:3000'
  : 'http://localhost:3000'; // We load the API's served page

function getApiPaths() {
  if (isDev) {
    // In dev, we assume we are running from apps/desktop
    // and apps/api is at ../api
    return {
      script: path.join(__dirname, '../../api/dist/src/main.js'),
      cwd: path.join(__dirname, '../../api'),
      static: path.join(__dirname, '../../web/dist'),
    };
  } else {
    // In prod, resources are unpacked
    // resources/api/src/main.js
    // resources/web
    return {
      script: path.join(process.resourcesPath, 'api/src/main.js'),
      cwd: path.join(process.resourcesPath, 'api'),
      static: path.join(process.resourcesPath, 'web'),
    };
  }
}

function startApi() {
  const paths = getApiPaths();
  
  if (!fs.existsSync(paths.script)) {
    console.error('API script not found at:', paths.script);
    return;
  }

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'priperfin.db');
  // Ensure we use a file protocol for sqlite
  const dbUrl = `file:${dbPath}`;

  console.log('Starting API...');
  console.log('Script:', paths.script);
  console.log('DB URL:', dbUrl);
  console.log('Static Path:', paths.static);
  console.log('CWD:', paths.cwd);
  console.log('isDev:', isDev);
  console.log('resourcesPath:', process.resourcesPath);

  const env = {
    ...process.env,
    PORT: API_PORT.toString(),
    DATABASE_URL: dbUrl,
    STATIC_PATH: paths.static,
    NODE_ENV: 'production',
    ELECTRON_RUN_AS_NODE: '1',
    NODE_PATH: isDev ? undefined : path.join(process.resourcesPath, 'app.asar', 'node_modules'),
  };

  console.log('Environment variables for API:');
  console.log('  PORT:', env.PORT);
  console.log('  DATABASE_URL:', env.DATABASE_URL);
  console.log('  STATIC_PATH:', env.STATIC_PATH);
  console.log('  NODE_ENV:', env.NODE_ENV);
  console.log('  NODE_PATH:', env.NODE_PATH);

  apiProcess = childProcess.spawn(process.execPath, [paths.script], {
    cwd: paths.cwd,
    env: env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  apiProcess.stdout?.on('data', (data) => {
    console.log(`[API]: ${data}`);
  });

  apiProcess.stderr?.on('data', (data) => {
    console.error(`[API ERROR]: ${data}`);
  });
  
  apiProcess.on('error', (err) => {
    console.error('[API FAILED]:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../resources/icon.png'), // Placeholder
  });

  // Wait for API to be ready before loading
  // Simple retry strategy
  const loadApp = () => {
    fetch(`http://localhost:${API_PORT}/api/health`) // Assuming a health check or just root
      .then(() => {
        mainWindow?.loadURL(WIN_URL);
      })
      .catch(() => {
        setTimeout(loadApp, 1000);
      });
  };

  // For now, just wait a bit or try loading
  setTimeout(() => {
    mainWindow?.loadURL(WIN_URL);
  }, 2000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startApi();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (apiProcess) {
    apiProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
