import React from 'react'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

import muiTheme from '../assets/muiTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

/**
 * Needed for onTouchTap due to iOS 300ms tap delay.
 * https://github.com/zilverline/react-tap-event-plugin
 */
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import ApplicationContainer from '../containers/ApplicationContainer'
import AddressBookContainer from '../containers/AddressBookContainer'
import MaintenanceContainer from '../containers/MaintenanceContainer'
import NetworkContainer from '../containers/NetworkContainer'
import TransactionsContainer from '../containers/TransactionsContainer'

const Root = ({ store }) => (
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
      <Router history={hashHistory}>
        <Route path='/' component={ApplicationContainer}>
          <IndexRoute component={TransactionsContainer} />
          <Route path='addressBook' component={AddressBookContainer} />
          <Route path='network' component={NetworkContainer} />
          <Route path='maintenance' component={MaintenanceContainer} />
          <Route path='transactions' component={TransactionsContainer} />
        </Route>
      </Router>
    </MuiThemeProvider>
  </Provider>
)

export default Root
