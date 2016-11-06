import { remote } from 'electron'

/** Create right click menu. */
const Menu = remote.Menu.buildFromTemplate([
  { label: 'Undo', role: 'undo', accelerator: 'CmdOrCtrl+Z' },
  { label: 'Redo', role: 'redo', accelerator: 'Shift+CmdOrCtrl+Z' },
  { type: 'separator' },
  { label: 'Cut', role: 'cut', accelerator: 'CmdOrCtrl+X' },
  { label: 'Copy', role: 'copy', accelerator: 'CmdOrCtrl+C' },
  { label: 'Paste', role: 'paste', accelerator: 'CmdOrCtrl+V' },
  { label: 'Select all', role: 'selectall', accelerator: 'CmdOrCtrl+A' }
])

/** Add right click listener. */
document.body.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  e.stopPropagation()

  while (e.target) {
    Menu.popup(remote.getCurrentWindow())
    break
  }
})
