'use strict'
import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Keep a global reference of the window object, else the window will
 * be closed automatically when the object is garbage collected.
 */
let mainWindow = null

// Renderer process state.
let running = true

// On: all windows closed.
app.on('window-all-closed', () => {
  /**
   * On OS X it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q.
   */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// On: ready to load the application.
app.on('ready', () => {
  const productionWindow = {
    'width': 1152,
    'height': 768,
    'minWidth': 800,
    'minHeight': 480,
    icon: __dirname + '/application/assets/images/logoRed.png'
  }

  const developmentWindow = {
    'width': 1152,
    'height': 768,
    'minWidth': 800,
    'minHeight': 480,
    icon: __dirname + '/application/assets/images/logoRed.png'
  }

  const selectedWindow = process.env.NODE_ENV === 'development' ? developmentWindow : productionWindow
  mainWindow = new BrowserWindow(selectedWindow)

  // Hide the browser's menu bar.
  mainWindow.setMenu(null)

  // Load the application starting point.
  mainWindow.loadURL('file://' + __dirname + '/application/index.html')

  // Chromium DevTools
  process.env.NODE_ENV === 'development' && mainWindow.webContents.openDevTools()

  // On: main window closed.
  mainWindow.on('closed', () => {
    /**
     * Dereference the window object, usually you would store windows
     * in an array if your app supports multi windows, this is the time
     * when you should delete the corresponding element.
     */
    mainWindow = null
  })

  // Handle saving of Redux state before closing the renderer process.
  mainWindow.on('close', (event) => {
    if (running) {
      // Prevent closing of the renderer process.
      event.preventDefault()

      mainWindow.webContents.send('stateSave')
      running = false
    }
  })

  // Quit application after receiving 'stateSaved' from renderer.
  ipcMain.on('stateSaved', () => {
    app.quit()
  })
})
