
const { app, BrowserWindow, ipcMain, shell, Notification } = require('electron');
const path = require('path');
const config = require('./config');
const { setupTray } = require('./tray');

let mainWindow = null;

// Determine target URL: CLI argument > config.devUrl
const targetUrl = process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1] || config.devUrl;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.window.defaultWidth,
    height: config.window.defaultHeight,
    minWidth: config.window.minWidth,
    minHeight: config.window.minHeight,
    title: 'Infinity Socials',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#030306',
      symbolColor: '#f5f5f7',
      height: 28
    },
    show: true,
    backgroundColor: '#040406',
    icon: path.join(__dirname, 'assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Directly load the actual hosted Infinity-Socials web application
  mainWindow.loadURL(targetUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup Windows tray
  setupTray(mainWindow);
}

// Ensure smooth instance handling
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('get-target-url', () => {
  return targetUrl;
});

ipcMain.on('open-external', (_event, url) => {
  shell.openExternal(url);
});

ipcMain.on('desktop-notify', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Infinity Socials',
      body: body || '',
      icon: path.join(__dirname, 'assets/logo.png')
    }).show();
  }
});
