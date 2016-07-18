import * as types from '../constants/ActionTypes'

const initialState = {
  last: 0,
  lowestAsk: 0,
  highestBid: 0,
  percentChange: 0,
  baseVolume: 0,
  quoteVolume: 0,
  dailyHigh: 0,
  dailyLow: 0,
  isConnecting: false,
  isConnected: false,
  lastUpdate: 0
}

const poloniex = (state = initialState, action) => {
  switch (action.type) {
    case types.POLONIEX_CLOSED:
      return {
        ...state,
        isConnecting: false,
        isConnected: false
      }

    case types.POLONIEX_OPEN:
      return {
        ...state,
        isConnecting: false,
        isConnected: true
      }

    case types.POLONIEX_REQUEST:
      return {
        ...state,
        isConnecting: true
      }

    case types.POLONIEX_TICKER:
      return {
        ...state,
        ...action.ticker,
        lastUpdate: Date.now() * 1000
      }

    default:
      return state
  }
}

export default poloniex
