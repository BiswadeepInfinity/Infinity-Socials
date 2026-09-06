const { app, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

let tray = null;

function setupTray(mainWindow) {
  const iconPath = path.join(__dirname, 'assets/logo.png');
  let icon = nativeImage.createFromPath(iconPath);
  
  if (!icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 });
  }

  tray = new Tray(icon);
  tray.setToolTip('Infinity Socials - Desktop Client');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Infinity Socials',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Reload App',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('trigger-reload');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Infinity Store & Feed',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('navigate-to', '/');
        }
      }
    },
    {
      label: 'Community Discussions',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('navigate-to', '/community');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });

  return tray;
}

module.exports = { setupTray };
