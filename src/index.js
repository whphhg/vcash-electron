/**
 * Vcash Electron GUI
 * Copyright (C) 2015-2017, whphhg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react'
import { render } from 'react-dom'
import { translate } from 'react-i18next'
import { BrowserRouter, Route } from 'react-router-dom'
import { useStrict } from 'mobx'
import { enableLogging } from 'mobx-logger'
import { Provider } from 'mobx-react'
import i18next from './utilities/i18next'
import './utilities/rightClickMenu'

/** Components */
import Connections from './components/Connections'
import MainMenu from './components/MainMenu'
import Root from './components/Root'

/** Store instances */
import connections from './stores/connections'
import gui from './stores/gui'
import rates from './stores/rates'

/** Set the i18next instance. */
translate.setI18n(i18next)

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

/** Enable MobX logging in development mode. */
if (process.env.NODE_ENV === 'dev') enableLogging()

/** Override and disable eval, which allows strings to be executed as code. */
// prettier-ignore
window.eval = global.eval = () => { // eslint-disable-line
  throw new Error('window.eval() is disabled for security reasons.')
}

render(
  <Provider connections={connections} gui={gui} rates={rates}>
    <BrowserRouter>
      <div id="App">
        <MainMenu />
        <Route exact path="/" component={Connections} />
        <Route path="/:id" component={Root} />
      </div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('application-root')
)
