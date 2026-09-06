const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('infinityDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',

  // Window control actions
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Navigation
  goBack: () => ipcRenderer.send('nav-back'),
  goForward: () => ipcRenderer.send('nav-forward'),
  reload: () => ipcRenderer.send('nav-reload'),
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // Notifications
  notify: (title, body) => ipcRenderer.send('desktop-notify', { title, body }),

  // Status updates (e.g. for Discord RPC or Titlebar)
  updateStatus: (status) => ipcRenderer.send('update-status', status),

  // Event Listeners
  onMaximizedChange: (callback) => {
    const handler = (_event, isMax) => callback(isMax);
    ipcRenderer.on('window-maximized-changed', handler);
    return () => ipcRenderer.removeListener('window-maximized-changed', handler);
  },
  onNavStateChange: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('nav-state-changed', handler);
    return () => ipcRenderer.removeListener('nav-state-changed', handler);
  }
});
