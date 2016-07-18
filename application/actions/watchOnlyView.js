import * as types from '../constants/ActionTypes'
import { watchOnlyEdit } from './watchOnly'

export const watchOnlyViewSetNote = (note) => {
  return (dispatch, getState) => {
    const isMatching = note.match(/^[a-zA-Z0-9,.:!?()-+ ]{0,100}$/)

    if (isMatching) {
      dispatch(watchOnlyEdit(getState().ui.watchOnlyView.address, note))
    }
  }
}

export const watchOnlyViewToggleDialog = (address) => {
  return (dispatch, getState) => {
    if (getState().ui.watchOnlyView.dialogOpen === false) {
      dispatch({
        type: types.WATCHONLY_VIEW_ADDRESS,
        address
      })
    }

    dispatch({
      type: types.WATCHONLY_VIEW_TOGGLE_DIALOG
    })
  }
}
