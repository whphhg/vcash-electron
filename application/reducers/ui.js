import { combineReducers } from 'redux'

import addressNew from './addressNew'
import currencyConverter from './currencyConverter'
import keyImport from './keyImport'
import menu from './menu'
import rewardCalculator from './rewardCalculator'
import send from './send'
import transaction from './transaction'
import walletEncrypt from './walletEncrypt'
import walletLock from './walletLock'
import walletUnlock from './walletUnlock'
import watchOnlyAdd from './watchOnlyAdd'
import watchOnlyView from './watchOnlyView'

const ui = combineReducers({
  addressNew,
  currencyConverter,
  keyImport,
  menu,
  rewardCalculator,
  send,
  transaction,
  walletEncrypt,
  walletLock,
  walletUnlock,
  watchOnlyAdd,
  watchOnlyView
})

export default ui
