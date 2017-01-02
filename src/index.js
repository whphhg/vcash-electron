import React from 'react'
import { render } from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { useStrict } from 'mobx'
import { Provider } from 'mobx-react'
import i18next from './utilities/i18next'
import './utilities/rightClickMenu.js'

/** Main container components. */
import Addresses from './components/Addresses'
import Maintenance from './components/Maintenance'
import Root from './components/Root'
import Transactions from './components/Transactions'

/** Store instances. */
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
import transactions from './stores/transactions'
import ui from './stores/ui'
import wallet from './stores/wallet'
import walletBackup from './stores/walletBackup'
import walletEncrypt from './stores/walletEncrypt'
import walletPassphraseChange from './stores/walletPassphraseChange'
import walletSeedDump from './stores/walletSeedDump'
import walletUnlock from './stores/walletUnlock'

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

/** Stores object. */
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
    <I18nextProvider i18n={i18next}>
      <Router history={hashHistory}>
        <Route path='/' component={Root}>
          <IndexRoute component={Transactions} />
          <Route path='addresses' component={Addresses} />
          <Route path='maintenance' component={Maintenance} />
        </Route>
      </Router>
    </I18nextProvider>
  </Provider>,
  document.getElementById('ui-root')
)
