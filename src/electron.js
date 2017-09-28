import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { format } from 'url'
import daemon from './daemon'

/** Global reference of the window object. */
let mainWindow = null

/** Set the application's name. */
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

  /** Create the application's main window. */
  mainWindow = new BrowserWindow({
    height: height(),
    icon: join(__dirname, 'assets', 'images', 'logoRed.png'),
    width: 1152
  })

  /** Hide Chromium's menu bar. */
  mainWindow.setMenu(null)

  /** Load the application's entry point. */
  mainWindow.loadURL(
    format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  /** Open Chromium's DevTools when in development mode. */
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
    /** Send SIGINT signal to the daemon process. */
    if (daemon !== null) daemon.kill('SIGINT')

    /** Dereference the window object. */
    mainWindow = null
  })
})

/** Quit once all of the windows are closed. */
app.on('window-all-closed', () => app.quit())
