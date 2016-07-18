import * as types from '../constants/ActionTypes'

const initialState = {
  list: {},
  isUpdating: false,
  lastUpdate: 0
}

const bitcoinAverage = (state = initialState, action) => {
  switch (action.type) {
    case types.BITCOINAVERAGE_REQUEST:
      return {
        ...state,
        isUpdating: true
      }

    case types.BITCOINAVERAGE_RESPONSE:
      return {
        list: action.list,
        isUpdating: false,
        lastUpdate: Date.now() * 1000
      }

    default:
      return state
  }
}

export default bitcoinAverage
