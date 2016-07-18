import * as types from '../constants/ActionTypes'

const initialState = {
  isOpen: false
}

const menu = (state = initialState, action) => {
  switch (action.type) {
    case types.MENU_TOGGLE_DRAWER:
      return {
        isOpen: !state.isOpen
      }

    default:
      return state
  }
}

export default menu
