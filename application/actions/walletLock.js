import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import { walletUnlockToggleSnackbar } from './walletUnlock'

export const walletLock = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'walletlock',
      params: []
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        dispatch(walletLockToggleSnackbar())

        if (getState().ui.walletUnlock.snackbarOpen) {
          dispatch(walletUnlockToggleSnackbar())
        }

        return dispatch({
          type: types.WALLET_LOCK
        })
      }
    })
  }
}

export const walletLockToggleSnackbar = () => ({
  type: types.WALLET_LOCK_TOGGLE_SNACKBAR
})
