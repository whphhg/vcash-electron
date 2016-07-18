import { combineReducers } from 'redux'

// Reducers
import bitcoinAverage from './bitcoinAverage'
import bittrex from './bittrex'
import poloniex from './poloniex'

const rates = combineReducers({
  bitcoinAverage,
  bittrex,
  poloniex
})

export default rates
