import { remote } from 'electron'

/** Build the context menu. */
const Menu = remote.Menu.buildFromTemplate([
  { role: 'undo' },
  { role: 'redo' },
  { type: 'separator' },
  { role: 'cut' },
  { role: 'copy' },
  { role: 'paste' }
])

/** Add event listener for context (right click) menu. */
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  e.stopPropagation()

  while (e.target) {
    Menu.popup(remote.getCurrentWindow())
    break
  }
})
