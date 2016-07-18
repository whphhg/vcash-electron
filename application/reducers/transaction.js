import * as types from '../constants/ActionTypes'

const initialState = {
  result: {},
  isOpen: false,
  updateTimer: 0
}

const transaction = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTION_LOOKUP:
      return {
        ...state,
        result: action.result,
        updateTimer: action.updateTimer
      }

    case types.TRANSACTION_TOGGLE_DIALOG:
      return {
        ...state,
        isOpen: !state.isOpen,
        updateTimer: 0
      }

    default:
      return state
  }
}

export default transaction
