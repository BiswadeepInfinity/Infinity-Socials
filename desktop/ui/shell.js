
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const webview = document.getElementById('infinity-webview');
  const splash = document.getElementById('loading-splash');
  const offlineView = document.getElementById('offline-view');
  const targetLabel = document.getElementById('target-url-label');
  const statusChip = document.getElementById('status-chip');
  const statusIndicator = document.querySelector('.status-indicator');
  const continuumProgress = document.getElementById('continuum-progress-bar');

  // Window controls
  const btnMin = document.getElementById('btn-minimize');
  const btnMax = document.getElementById('btn-maximize');
  const btnClose = document.getElementById('btn-close');

  // Nav buttons
  const btnBack = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');
  const btnReload = document.getElementById('btn-reload');
  const btnRetry = document.getElementById('btn-retry');
  const btnOpenBrowser = document.getElementById('btn-open-browser');
  const btnDevTools = document.getElementById('btn-toggle-devtools');
  const brandHomeBtn = document.getElementById('brand-home-btn');
  const searchInput = document.getElementById('header-search-input');

  // Capsule Dock Links
  const dockLinks = document.querySelectorAll('.dock-link');

  let currentTargetUrl = 'https://infinity-socials.vercel.app';

  // Request target URL from main process
  ipcRenderer.invoke('get-target-url').then((url) => {
    currentTargetUrl = url;
    if (targetLabel) targetLabel.textContent = url;
    loadAppUrl(url);
  });

  function loadAppUrl(url) {
    splash.classList.remove('fade-out');
    splash.style.display = 'flex';
    offlineView.classList.add('hidden');
    webview.src = url;
  }

  // Window button events
  btnMin.addEventListener('click', () => ipcRenderer.send('window-minimize'));
  btnMax.addEventListener('click', () => ipcRenderer.send('window-maximize'));
  btnClose.addEventListener('click', () => ipcRenderer.send('window-close'));

  // Brand click -> Go home
  brandHomeBtn.addEventListener('click', () => {
    navigateToRoute('/');
  });

  // Navigation events
  btnBack.addEventListener('click', () => {
    if (webview.canGoBack()) webview.goBack();
  });

  btnForward.addEventListener('click', () => {
    if (webview.canGoForward()) webview.goForward();
  });

  btnReload.addEventListener('click', () => {
    splash.classList.remove('fade-out');
    splash.style.display = 'flex';
    webview.reload();
  });

  btnRetry.addEventListener('click', () => {
    loadAppUrl(currentTargetUrl);
  });

  btnOpenBrowser.addEventListener('click', () => {
    const activeUrl = webview.getURL() || currentTargetUrl;
    ipcRenderer.send('open-external', activeUrl);
  });

  btnDevTools.addEventListener('click', () => {
    if (webview.isDevToolsOpened()) {
      webview.closeDevTools();
    } else {
      webview.openDevTools();
    }
  });

  // Search input in header
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = encodeURIComponent(searchInput.value.trim());
        navigateToRoute(`/browse?search=${query}`);
        searchInput.value = '';
      }
    });
  }

  // Capsule Dock Navigation
  dockLinks.forEach(link => {
    link.addEventListener('click', () => {
      dockLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const route = link.getAttribute('data-route') || '/';
      navigateToRoute(route);
    });
  });

  function navigateToRoute(route) {
    try {
      const baseUrl = new URL(currentTargetUrl);
      if (route.startsWith('/#')) {
        baseUrl.pathname = '/';
        baseUrl.hash = route.replace('/', '');
      } else {
        const parts = route.split('?');
        baseUrl.pathname = parts[0];
        baseUrl.search = parts[1] || '';
      }
      webview.loadURL(baseUrl.toString());
    } catch (e) {
      webview.loadURL(currentTargetUrl + route);
    }
  }

  // Webview lifecycle
  webview.addEventListener('did-start-loading', () => {
    if (continuumProgress) continuumProgress.style.width = '60%';
  });

  webview.addEventListener('did-stop-loading', () => {
    if (continuumProgress) continuumProgress.style.width = '100%';
    setTimeout(() => {
      if (continuumProgress) continuumProgress.style.width = '35%';
    }, 400);

    updateNavButtons();
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 350);
    }, 300);
  });

  webview.addEventListener('did-navigate', (e) => {
    setConnectionState(true);
    updateActiveDock(e.url);
    updateNavButtons();
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    updateActiveDock(e.url);
    updateNavButtons();
  });

  webview.addEventListener('did-fail-load', (e) => {
    if (e.errorCode !== -3) {
      splash.style.display = 'none';
      offlineView.classList.remove('hidden');
      setConnectionState(false);
    }
  });

  function setConnectionState(isOnline) {
    if (isOnline) {
      offlineView.classList.add('hidden');
      statusIndicator.classList.remove('offline');
      statusChip.textContent = 'CONNECTED';
    } else {
      statusIndicator.classList.add('offline');
      statusChip.textContent = 'OFFLINE';
    }
  }

  function updateActiveDock(currentUrl) {
    try {
      const url = new URL(currentUrl);
      const path = url.pathname;
      dockLinks.forEach(link => {
        const route = link.getAttribute('data-route') || '/';
        if (route === '/' && path === '/') {
          link.classList.add('active');
        } else if (route !== '/' && path.startsWith(route)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    } catch (e) {}
  }

  function updateNavButtons() {
    btnBack.disabled = !webview.canGoBack();
    btnForward.disabled = !webview.canGoForward();
  }

  // Handle reload or navigate events sent from tray / main
  ipcRenderer.on('trigger-reload', () => {
    webview.reload();
  });

  ipcRenderer.on('navigate-to', (_event, route) => {
    navigateToRoute(route);
  });
});
