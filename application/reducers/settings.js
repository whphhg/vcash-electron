import * as types from '../constants/ActionTypes'

let initialState = {
  localCurrency: 'EUR'
}

const settings = (state = initialState, action) => {
  switch(action.type) {
    case types.SET_LOCAL_CURRENCY:
      return {
        ...state,
        localCurrency: action.localCurrency
      }

    default:
      return state
  }
}

export default settings
