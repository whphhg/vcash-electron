import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { format } from 'url'
import daemon from './daemon'

/** Keep a global reference of the window object. */
let mainWindow = null

/** Ready to load the GUI. */
app.on('ready', () => {
  /** Provide default window height depending on the platform. */
  const height = () => {
    switch (process.platform) {
      case 'win32':
        return 738

      case 'darwin':
        return 722

      default:
        return 700
    }
  }

  mainWindow = new BrowserWindow({
    height: height(),
    icon: join(__dirname, 'assets', 'images', 'logoRed.png'),
    webPreferences: { experimentalFeatures: true },
    width: 1152
  })

  /** Hide browser's menu bar. */
  mainWindow.setMenu(null)

  /** Load the GUI starting point. */
  mainWindow.loadURL(
    format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  /** Open Chromium DevTools in dev mode. */
  process.env.NODE_ENV === 'dev' && mainWindow.webContents.openDevTools()

  /** Open external links using OS default browser. */
  mainWindow.webContents.on('new-window', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  /** Main window closed. */
  mainWindow.on('closed', () => {
    if (daemon !== null) {
      daemon.kill('SIGINT')
    }

    /** Dereference the window object. */
    mainWindow = null
  })
})

/** All of the windows are closed. */
app.on('window-all-closed', () => {
  app.quit()
})
