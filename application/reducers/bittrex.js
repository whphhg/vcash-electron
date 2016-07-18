import * as types from '../constants/ActionTypes'

const initialState = {
  high: 0,
  low: 0,
  volume: 0,
  last: 0,
  bid: 0,
  ask: 0,
  openBuyOrders: 0,
  openSellOrders: 0,
  isUpdating: false,
  lastUpdate: 0
}

const bittrex = (state = initialState, action) => {
  switch (action.type) {
    case types.BITTREX_REQUEST:
      return {
        ...state,
        isUpdating: true
      }

    case types.BITTREX_RESPONSE:
      return {
        ...state,
        ...action.data,
        isUpdating: false,
        lastUpdate: Date.now() * 1000
      }

    default:
      return state
  }
}

export default bittrex
