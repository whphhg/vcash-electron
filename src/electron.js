import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { format } from 'url'

/** Store instance */
import daemon from './stores/daemon'

/** Global reference of the window object. */
let mainWindow = null

/** Set application name. */
app.setName('Vcash Electron GUI')

/** Keep separate userData directories for development and production modes. */
app.setPath(
  'userData',
  join(
    app.getPath('appData'),
    ''.concat(app.getName(), process.env.NODE_ENV === 'dev' ? ' dev' : '')
  )
)

/** Electron initialization finished. */
app.on('ready', () => {
  /** Return default window height depending on the platform. */
  const height = () => {
    if (process.platform === 'win32') return 738
    if (process.platform === 'darwin') return 722
    return 700
  }

  /** Create the main window. */
  mainWindow = new BrowserWindow({
    height: height(),
    icon: join(__dirname, 'assets', 'images', 'logoRed.png'),
    width: 1200
  })

  /** Hide Chromium menu bar. */
  mainWindow.setMenu(null)

  /** Load the application entry point. */
  mainWindow.loadURL(
    format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  /** Open Chromium DevTools in development mode. */
  if (process.env.NODE_ENV === 'dev') mainWindow.webContents.openDevTools()

  /** Open external links using OS default browser. */
  mainWindow.webContents.on('new-window', (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  /** Main window closed. */
  mainWindow.on('closed', () => {
    /** Stop the daemon process. */
    daemon.stop()

    /** Dereference the window object. */
    mainWindow = null
  })
})

/** Quit once all of the windows are closed. */
app.on('window-all-closed', () => app.quit())
