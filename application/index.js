'use strict'

/**
 * IDEA: Contacts with VCF import/export support (node-vcf).
 * IDEA: Guided tour (react-joyride).
 * TODO: Implement translations (i18next, react-i18next, moment-timezone).
 * TODO: Implement key dump.
 * TODO: Implement wallet dump.
 * TODO: Implement wallet backup.
 * TODO: Implement wallet check.
 * TODO: Implement wallet repair.
 * TODO: Implement wallet passphrase change.
 */

import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { Provider } from 'mobx-react'

/** Use MobX strict mode. Only actions can change the state. */
import { useStrict } from 'mobx'
useStrict(true)

/** Material-ui theme. */
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import muiTheme from './assets/muiTheme'

/**
 * Needed for onTouchTap.
 * @see {@link https://stackoverflow.com/a/34015469/988941|Stackoverflow}
 */
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

/** Main UI components. */
import Application from './components/Application'
import Transactions from './components/Transactions'
import AddressBook from './components/AddressBook'
import Network from './components/Network'
import Maintenance from './components/Maintenance'

/** Store instances. */
import addressBook from './stores/addressBook'
import addressNew from './stores/addressNew'
import chainBlender from './stores/chainBlender'
import currencyConverter from './stores/currencyConverter'
import daemon from './stores/daemon'
import keyImport from './stores/keyImport'
import network from './stores/network'
import rates from './stores/rates'
import rewardCalculator from './stores/rewardCalculator'
import send from './stores/send'
import transaction from './stores/transaction'
import transactions from './stores/transactions'
import wallet from './stores/wallet'
import walletEncrypt from './stores/walletEncrypt'
import walletLock from './stores/walletLock'
import walletUnlock from './stores/walletUnlock'
import watchOnly from './stores/watchOnly'
import watchOnlyAdd from './stores/watchOnlyAdd'

render(
  <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
    <Provider
      addressBook={addressBook}
      addressNew={addressNew}
      chainBlender={chainBlender}
      currencyConverter={currencyConverter}
      daemon={daemon}
      keyImport={keyImport}
      network={network}
      rates={rates}
      rewardCalculator={rewardCalculator}
      send={send}
      transaction={transaction}
      transactions={transactions}
      wallet={wallet}
      walletEncrypt={walletEncrypt}
      walletLock={walletLock}
      walletUnlock={walletUnlock}
      watchOnly={watchOnly}
      watchOnlyAdd={watchOnlyAdd}
    >
      <Router history={hashHistory}>
        <Route path='/' component={Application}>
          <IndexRoute component={Transactions} />
          <Route path='transactions' component={Transactions} />
          <Route path='addressBook' component={AddressBook} />
          <Route path='network' component={Network} />
          <Route path='maintenance' component={Maintenance} />
        </Route>
      </Router>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('application-root')
)
