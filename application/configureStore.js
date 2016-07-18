import { createStore, applyMiddleware, compose } from 'redux'

import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import DevToolsContainer from './containers/DevToolsContainer'

import reducers from './reducers/root'

import { stateLoad, stateSave } from './localStorage'
import { bitcoinAverage } from './actions/bitcoinAverage'
import { bittrex } from './actions/bittrex'
import { chainBlenderInfo } from './actions/chainBlender'
import { incentiveInfo } from './actions/incentive'
import { networkInfo } from './actions/network'
import { poloniex } from './actions/poloniex'
import { transactions } from './actions/transactions'
import { walletInfo } from './actions/wallet'
import { watchOnlyExplorerLookup } from './actions/watchOnly'

const configureStore = () => {
  const loggerMiddleware = createLogger({ collapsed: true })
  let store
  let persistedState = stateLoad()

  switch (process.env.NODE_ENV) {
    case 'development':
      store = createStore(
        reducers,
        persistedState,
        compose(
          applyMiddleware(
            thunkMiddleware,
            loggerMiddleware
          ),
          DevToolsContainer.instrument()
        )
      )
    break

    default:
      store = createStore(
        reducers,
        persistedState,
        applyMiddleware(
          thunkMiddleware
        )
      )
    break
  }

  store.dispatch(bitcoinAverage())
  store.dispatch(bittrex())
  store.dispatch(chainBlenderInfo())
  store.dispatch(incentiveInfo())
  store.dispatch(networkInfo())
  store.dispatch(poloniex())
  store.dispatch(transactions())
  store.dispatch(walletInfo())
  store.dispatch(watchOnlyExplorerLookup())

  /**
   * Provide store to ipcRenderer waiting for application termination
   * to save parts of Redux state to localStorage.
   */
  stateSave(store)

  return store
}

export default configureStore
