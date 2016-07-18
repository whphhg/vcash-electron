import { combineReducers } from 'redux'

import addressBook from './addressBook'
import chainBlender from './chainBlender'
import incentive from './incentive'
import network from './network'
import rates from './rates'
import settings from './settings'
import transactions from './transactions'
import ui from './ui'
import wallet from './wallet'
import watchOnly from './watchOnly'

const reducers = combineReducers({
  addressBook,
  chainBlender,
  incentive,
  network,
  rates,
  settings,
  transactions,
  ui,
  wallet,
  watchOnly
})

export default reducers
