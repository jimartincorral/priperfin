import { app, BrowserWindow, dialog, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { AppPaths } from './paths';

interface MenuContext {
  paths: AppPaths;
  getServerUrl: () => string | undefined;
}

export function buildMenu({ paths, getServerUrl }: MenuContext): Menu {
  const isMac = process.platform === 'darwin';

  const showAbout = () => {
    const url = getServerUrl();
    dialog.showMessageBox({
      type: 'info',
      title: 'About PriPerFin',
      message: `PriPerFin ${app.getVersion()}`,
      detail: [
        `Electron ${process.versions.electron}`,
        `Database: ${paths.dbPath}`,
        `Backups: ${paths.backupDir}`,
        url ? `Server: ${url}` : 'Server: not running',
      ].join('\n'),
      buttons: ['OK'],
    });
  };

  const fileItems: MenuItemConstructorOptions[] = [
    {
      label: 'Open Data Folder',
      click: () => void shell.openPath(paths.userData),
    },
    {
      label: 'Open Backups Folder',
      click: () => void shell.openPath(paths.backupDir),
    },
    {
      label: 'Open Logs Folder',
      click: () => void shell.openPath(paths.logDir),
    },
    { type: 'separator' },
    {
      label: 'Open in Browser',
      enabled: Boolean(getServerUrl()),
      click: () => {
        const url = getServerUrl();
        if (url) void shell.openExternal(url);
      },
    },
  ];

  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { label: 'About PriPerFin', click: showAbout },
        { type: 'separator' },
        ...fileItems,
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  } else {
    template.push({
      label: '&File',
      submenu: [...fileItems, { type: 'separator' }, { role: 'quit' }],
    });
  }

  // Without an explicit edit menu, Cmd+C / Cmd+V do not work in text inputs on
  // macOS, because the accelerators are never registered.
  template.push({
    label: '&Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  });

  template.push({
    label: '&View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  });

  template.push({
    label: '&Window',
    submenu: isMac
      ? [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
      : [{ role: 'minimize' }, { role: 'close' }],
  });

  if (!isMac) {
    template.push({
      label: '&Help',
      submenu: [{ label: 'About PriPerFin', click: showAbout }],
    });
  }

  return Menu.buildFromTemplate(template);
}

export function focusWindow(window: BrowserWindow | null): void {
  if (!window) return;
  if (window.isMinimized()) window.restore();
  window.focus();
}
