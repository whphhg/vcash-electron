import React from 'react'
import { render } from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { useStrict } from 'mobx'
import { Provider } from 'mobx-react'
import i18next from './utilities/i18next'
import './utilities/rightClickMenu'

/** Route view components. */
import Addresses from './components/Addresses'
import Maintenance from './components/Maintenance'
import Network from './components/Network'
import Root from './components/Root'
import Transactions from './components/Transactions'
import Welcome from './components/Welcome'

/** Initialized MobX stores. */
import * as stores from './stores'

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

render(
  <Provider {...stores}>
    <I18nextProvider i18n={i18next}>
      <Router history={hashHistory}>
        <Route path='/welcome' component={Welcome} />
        <Route path='/' component={Root}>
          <IndexRoute component={Transactions} />
          <Route path='addresses' component={Addresses} />
          <Route path='network' component={Network} />
          <Route path='maintenance' component={Maintenance} />
        </Route>
      </Router>
    </I18nextProvider>
  </Provider>,
  document.getElementById('ui-root')
)
