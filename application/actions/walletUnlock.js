import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

export const walletUnlock = () => {
  return (dispatch, getState) => {
    const passphrase = getState().ui.walletUnlock.passphrase

    const options = {
      method: 'walletpassphrase',
      params: [passphrase]
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        if (response.hasOwnProperty('error')) {
          // error_code_wallet_passphrase_incorrect = -14 (passphrase incorrect)
          switch (response.error.code) {
            case -14:
              dispatch({
                type: types.WALLET_UNLOCK_SET_ERROR,
                button: false,
                error: 'incorrect'
              })
            break
          }
        } else {
          dispatch(walletUnlockToggleDialog())
          dispatch(walletUnlockToggleSnackbar())
          dispatch({
            type: types.WALLET_UNLOCK
          })
        }
      }
    })
  }
}

export const walletUnlockSetPassphrase = (passphrase) => {
  return (dispatch, getState) => {
    if (passphrase.length === 0) {
      if (getState().ui.walletUnlock.errors.missing === false) {
        dispatch({
          type: types.WALLET_UNLOCK_SET_ERROR,
          button: false,
          error: 'missing'
        })
      }
    } else {
      if (getState().ui.walletUnlock.errors.missing || getState().ui.walletUnlock.errors.incorrect) {
        dispatch({
          type: types.WALLET_UNLOCK_SET_ERROR,
          button: true,
          error: ''
        })
      }
    }

    dispatch({
      type: types.WALLET_UNLOCK_SET_PASSPHRASE,
      passphrase
    })
  }
}

export const walletUnlockToggleDialog = () => {
  return (dispatch, getState) => {
    dispatch({
      type: types.WALLET_UNLOCK_TOGGLE_DIALOG
    })

    if (getState().ui.walletUnlock.dialogOpen) {
      dispatch(walletUnlockSetPassphrase(''))
    }
  }
}

export const walletUnlockToggleSnackbar = () => ({
  type: types.WALLET_UNLOCK_TOGGLE_SNACKBAR
})
