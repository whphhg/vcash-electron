import * as types from '../constants/ActionTypes'

const initialState = {
  address: '',
  dialogOpen: false
}

const watchOnlyView = (state = initialState, action) => {
  switch (action.type) {
    case types.WATCHONLY_VIEW_ADDRESS:
      return {
        ...state,
        address: action.address
      }

    case types.WATCHONLY_VIEW_TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: !state.dialogOpen
      }

    default:
      return state
  }
}

export default watchOnlyView
