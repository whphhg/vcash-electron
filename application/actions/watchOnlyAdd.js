import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

export const watchOnlyAddSetAddress = (address) => {
  return (dispatch, getState) => {
    const isMatching = address.match(/^[a-zA-Z0-9]{0,34}$/)

    const alreadyAdded = getState().ui.watchOnlyAdd.errors.alreadyAdded
    const invalid = getState().ui.watchOnlyAdd.errors.invalid
    const isMine = getState().ui.watchOnlyAdd.errors.isMine
    const missing = getState().ui.watchOnlyAdd.errors.missing

    if (isMatching) {
      if (address.length === 0) {
        if (missing === false) {
          dispatch({
            type: types.WATCHONLY_ADD_SET_ERROR,
            button: false,
            error: 'missing'
          })
        }
      } else {
        if (address.length === 34) {
          const options = {
            method: 'validateaddress',
            params: [address]
          }

          rpc(options, dispatch, getState, (response) => {
            if (response !== null) {
              if (response.result.isvalid === false) {
                return dispatch({
                  type: types.WATCHONLY_ADD_SET_ERROR,
                  button: false,
                  error: 'invalid'
                })
              }

              if (response.result.ismine) {
                return dispatch({
                  type: types.WATCHONLY_ADD_SET_ERROR,
                  button: false,
                  error: 'isMine'
                })
              }

              if (response.result.isvalid) {
                if (getState().watchOnly.byAddress[address]) {
                  dispatch({
                    type: types.WATCHONLY_ADD_SET_ERROR,
                    button: false,
                    error: 'alreadyAdded'
                  })
                } else {
                  return dispatch({
                    type: types.WATCHONLY_ADD_SET_ERROR,
                    button: true,
                    error: ''
                  })
                }
              }
            }
          })
        } else {
          if (missing === false) {
            dispatch({
              type: types.WATCHONLY_ADD_SET_ERROR,
              button: false,
              error: 'missing'
            })
          }
        }
      }

      dispatch({
        type: types.WATCHONLY_ADD_SET_ADDRESS,
        address
      })
    }
  }
}

export const watchOnlyAddSetNote = (note) => {
  return (dispatch, getState) => {
    const isMatching = note.match(/^[a-zA-Z0-9,.:!? ]{0,100}$/)

    if (isMatching) {
      dispatch({
        type: types.WATCHONLY_ADD_SET_NOTE,
        note
      })
    }
  }
}

export const watchOnlyAddToggleDialog = () => {
  return (dispatch, getState) => {
    dispatch({
      type: types.WATCHONLY_ADD_TOGGLE_DIALOG
    })

    if (getState().ui.watchOnlyAdd.dialogOpen) {
      dispatch(watchOnlyAddSetAddress(''))
      dispatch(watchOnlyAddSetNote(''))

      if (getState().ui.watchOnlyAdd.snackbarOpen) {
        dispatch(watchOnlyAddToggleSnackbar())
      }
    }
  }
}

export const watchOnlyAddToggleSnackbar = () => ({
  type: types.WATCHONLY_ADD_TOGGLE_SNACKBAR
})
