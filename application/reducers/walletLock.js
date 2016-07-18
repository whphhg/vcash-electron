import * as types from '../constants/ActionTypes'

const initialState = {
  isOpen: false
}

const walletLock = (state = initialState, action) => {
  switch (action.type) {
    case types.WALLET_LOCK_TOGGLE_SNACKBAR:
      return {
        isOpen: !state.isOpen
      }

    default:
      return state
  }
}

export default walletLock
