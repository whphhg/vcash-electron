import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { Provider } from 'mobx-react'
import { useStrict } from 'mobx'
import { notification } from 'antd'
import { remote } from 'electron'

/** Build the context menu. */
const Menu = remote.Menu.buildFromTemplate([
  { label: 'Undo', role: 'undo', accelerator: 'CmdOrCtrl+Z' },
  { label: 'Redo', role: 'redo', accelerator: 'Shift+CmdOrCtrl+Z' },
  { type: 'separator' },
  { label: 'Cut', role: 'cut', accelerator: 'CmdOrCtrl+X' },
  { label: 'Copy', role: 'copy', accelerator: 'CmdOrCtrl+C' },
  { label: 'Paste', role: 'paste', accelerator: 'CmdOrCtrl+V' },
  { label: 'Select all', role: 'selectall', accelerator: 'CmdOrCtrl+A' }
])

/** Add event listener for context (right click) menu. */
document.body.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  e.stopPropagation()

  while (e.target) {
    Menu.popup(remote.getCurrentWindow())
    break
  }
})

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

/** Set notification's top margin. */
notification.config({ top: 65 })

/** Required components. */
import Root from './components/Root'
import Transactions from './components/Transactions'
// import Send from './components/Send'
import Addresses from './components/Addresses'
import Maintenance from './components/Maintenance'

/** Required store instances. */
import addresses from './stores/addresses'
import addressNew from './stores/addressNew'
import chainBlender from './stores/chainBlender'
import currencyConverter from './stores/currencyConverter'
import keyDump from './stores/keyDump'
import keyImport from './stores/keyImport'
import network from './stores/network'
import rates from './stores/rates'
import rewardCalculator from './stores/rewardCalculator'
import rpc from './stores/rpc'
import send from './stores/send'
import transaction from './stores/transaction'
import transactions from './stores/transactions'
import ui from './stores/ui'
import wallet from './stores/wallet'
import walletBackup from './stores/walletBackup'
import walletEncrypt from './stores/walletEncrypt'
import walletPassphraseChange from './stores/walletPassphraseChange'
import walletSeedDump from './stores/walletSeedDump'
import walletUnlock from './stores/walletUnlock'

const stores = {
  addresses,
  addressNew,
  chainBlender,
  currencyConverter,
  keyDump,
  keyImport,
  network,
  rates,
  rewardCalculator,
  rpc,
  send,
  transaction,
  transactions,
  ui,
  wallet,
  walletBackup,
  walletEncrypt,
  walletPassphraseChange,
  walletSeedDump,
  walletUnlock
}

render(
  <Provider {...stores}>
    <Router history={hashHistory}>
      <Route path='/' component={Root}>
        <IndexRoute component={Transactions} />
        <Route path='send' component={Transactions} />
        <Route path='addresses' component={Addresses} />
        <Route path='maintenance' component={Maintenance} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('application-root')
)
