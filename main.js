'use strict'
import { app, BrowserWindow } from 'electron'

/**
 * Keep a global reference of the window object, else the window will
 * be closed automatically when the object is garbage collected.
 */
let mainWindow = null

/** All the windows are closed. */
app.on('window-all-closed', () => {
  /**
   * On OS X it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q.
   */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/** Ready to load the application. */
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1152,
    height: 720,
    icon: __dirname + '/application/assets/images/logoRed.png'
  })

  /** Hide browser's menu bar. */
  mainWindow.setMenu(null)

  /** Load the application starting point. */
  mainWindow.loadURL('file://' + __dirname + '/application/index.html')

  /** Open Chromium DevTools if in dev mode. */
  process.env.NODE_ENV === 'dev' && mainWindow.webContents.openDevTools()

  /** Main window closed. */
  mainWindow.on('closed', () => {
    /**
     * Dereference the window object, usually you would store windows
     * in an array if your app supports multi windows, this is the time
     * when you should delete the corresponding element.
     */
    mainWindow = null
  })
})
