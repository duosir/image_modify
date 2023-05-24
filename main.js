const {app, BrowserWindow, screen,  globalShortcut} = require('electron')
const remote = require('@electron/remote/main');
const path = require("path");
remote.initialize();
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
// 解决启动黑屏
app.disableHardwareAcceleration()
function createWindow() {
    let size = screen.getPrimaryDisplay().workAreaSize
    const win = new BrowserWindow({
        show: false,
        width: Math.floor(size.width * 0.7),
        height: Math.floor(size.height * 0.8),
        // icon: path.join(__dirname, 'static/img/crack.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true
    })
    remote.enable(win.webContents);
    win.loadFile('UI/index.html');
    win.show();
}
// 快捷键注册
function registryShortcut() {
    globalShortcut.register('CommandOrControl+Shift+i', () => {
        // 获取当前窗口
        BrowserWindow.getFocusedWindow().webContents.openDevTools();
    });
}
app.whenReady().then(() => {
    registryShortcut()
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});