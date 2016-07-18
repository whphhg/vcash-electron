import * as types from '../constants/ActionTypes'

const initialState = {
  blendState: 'none',
  balance: 0,
  denominatedBalance: 0,
  nonDenominatedBalance: 0,
  blendedBalance: 0,
  blendedPercentage: 0,
  isActivated: false
}

const chainBlender = (state = initialState, action) => {
  switch (action.type) {
    case types.CHAINBLENDER_INFO:
      return {
        blendState: action.blendstate,
        balance: action.balance,
        denominatedBalance: action.denominatedbalance,
        nonDenominatedBalance: action.nondenominatedbalance,
        blendedBalance: action.blendedbalance,
        blendedPercentage: action.blendedpercentage,
        isActivated: action.isActivated || state.isActivated
      }

    case types.CHAINBLENDER_TOGGLE:
      return {
        ...state,
        isActivated: !state.isActivated
      }

    default:
      return state
  }
}

export default chainBlender
