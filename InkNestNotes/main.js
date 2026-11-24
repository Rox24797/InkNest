'use strict';
// InkNest Notes — Electron main process
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

app.setName('InkNest Notes');
if (process.platform === 'win32') app.setAppUserModelId('com.inknest.notes');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let win = null;

  const createWindow = () => {
    win = new BrowserWindow({
      width: 1380,
      height: 880,
      minWidth: 920,
      minHeight: 620,
      title: 'InkNest Notes',
      icon: path.join(__dirname, 'build', 'icon.png'),
      backgroundColor: '#f3f4fb',
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        spellcheck: false,
      },
    });
    win.removeMenu();
    win.once('ready-to-show', () => win.show());
    win.loadFile(path.join(__dirname, 'app', 'index.html'));

    // keep the window title fixed unless the app sets one (timer does)
    win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
    win.webContents.on('will-navigate', (e, url) => {
      if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); }
    });
    // F11 = full screen, Ctrl+Shift+I = dev tools (handy when reporting a bug)
    win.webContents.on('before-input-event', (e, input) => {
      if (input.type !== 'keyDown') return;
      if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
      if (input.control && input.shift && input.key.toLowerCase() === 'i') win.webContents.toggleDevTools();
    });
    win.on('closed', () => { win = null; });
  };

  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
