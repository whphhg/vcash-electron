import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { Provider } from 'mobx-react'
import { useStrict } from 'mobx'
import { notification } from 'antd'

/** Enable right click menu. */
import rightClickMenu from './utilities/rightClickMenu'

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

/** Set notification's top margin. */
notification.config({ top: 65 })

/** Required components. */
import Root from './components/Root'
import Addresses from './components/Addresses'
import Transactions from './components/Transactions'
import Network from './components/Network'
import Maintenance from './components/Maintenance'
//import Send from './components/Send'

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
import wallet from './stores/wallet'
import walletBackup from './stores/walletBackup'
import walletDump from './stores/walletDump'
import walletEncrypt from './stores/walletEncrypt'
import walletUnlock from './stores/walletUnlock'

const stores = {
  addresses, addressNew,
  chainBlender, currencyConverter,
  keyDump, keyImport,
  network,
  rates, rewardCalculator, rpc,
  send,
  transaction, transactions,
  wallet, walletBackup, walletDump, walletEncrypt, walletUnlock
}

render(
  <Provider {...stores}>
    <Router history={hashHistory}>
      <Route path='/' component={Root}>
        <IndexRoute component={Transactions} />
        <Route path='send' component={Transactions} />
        <Route path='addresses' component={Addresses} />
        <Route path='network' component={Network} />
        <Route path='maintenance' component={Maintenance} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('application-root')
)
