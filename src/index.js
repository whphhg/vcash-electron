/**
 * Vcash Electron GUI
 * Copyright (C) 2015-2018, whphhg
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
import { join } from 'path'
import i18next from './utilities/i18next.js'
import './utilities/rightClickMenu.js'

/** Components */
import Connections from './components/screens/Connections.js'
import MainMenu from './components/menus/MainMenu.js'
import Root from './components/Root.js'

/** Store instances */
import connections from './stores/connections.js'
import gui from './stores/gui.js'
import rates from './stores/rates.js'

/** Set the i18next instance. */
translate.setI18n(i18next)

/** Use MobX strict mode, allowing only actions to alter the state. */
useStrict(true)

/** Enable MobX logging in development mode. */
if (process.env.NODE_ENV === 'dev') enableLogging()

/** Override and disable eval, which allows strings to be executed as code. */
// prettier-ignore
window.eval = global.eval = () => { // eslint-disable-line
  throw new Error('eval() is disabled for security reasons.')
}

render(
  <Provider connections={connections} gui={gui} rates={rates}>
    <BrowserRouter>
      <div id="App">
        <div id="MainMenu">
          <div className="logo">
            <img src={join(__dirname, 'assets', 'images', 'logoGrey.png')} />
          </div>
          <MainMenu />
        </div>
        <Route exact path="/" component={Connections} />
        <Route path="/:id" component={Root} />
      </div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('application-root')
)
