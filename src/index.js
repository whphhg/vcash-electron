import React from 'react'
import { render } from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import { HashRouter, Route } from 'react-router-dom'
import { useStrict } from 'mobx'
import { enableLogging } from 'mobx-logger'
import { Provider } from 'mobx-react'
import i18next from './utilities/i18next'
import './utilities/rightClickMenu'

/** Required components. */
import Connections from './components/Connections'
import Root from './components/Root'
import Welcome from './components/Welcome'

/** MobX stores. */
import connections from './stores/connections'
import gui from './stores/gui'
import rates from './stores/rates'

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

/** Enable MobX logging in dev mode. */
process.env.NODE_ENV === 'dev' && enableLogging()

render(
  <Provider connections={connections} gui={gui} rates={rates}>
    <I18nextProvider i18n={i18next}>
      <HashRouter>
        <div>
          <Connections />
          <Route exact path='/' component={Welcome} />
          <Route path='/:uid' component={Root} />
        </div>
      </HashRouter>
    </I18nextProvider>
  </Provider>,
  document.getElementById('ui-root')
)
