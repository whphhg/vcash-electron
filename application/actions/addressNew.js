import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import { addressBook, addressBookSetShowAccount } from './addressBook'

export const addressNew = () => {
  return (dispatch, getState) => {
    const account = getState().ui.addressNew.account
    const options = {
      method: 'getnewaddress',
      params: [account === 'Default' ? '' : account]
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        // TODO: Handle error_code_wallet_keypool_ran_out.

        dispatch(addressBook())
        dispatch(addressNewToggleDialog())
        dispatch(addressNewToggleSnackbar())

        if (getState().addressBook.showAccount !== account) {
          dispatch(addressBookSetShowAccount(account))
        }

        process.env.NODE_ENV === 'development' && console.info('RPC: Requested new address for account "' + account + '".')
      }
    })
  }
}

export const addressNewSetAccount = (account) => {
  return (dispatch, getState) => {
    const isMatching = account.match(/^[a-zA-Z0-9 ]{0,100}$/)

    const invalid = getState().ui.addressNew.errors.invalid
    const missing = getState().ui.addressNew.errors.missing

    if (isMatching) {
      if (account.length === 0) {
        if (missing === false) {
          dispatch({
            type: types.ADDRESS_NEW_SET_ERROR,
            button: false,
            error: 'missing'
          })
        }
      } else {
        if (missing || invalid) {
          dispatch({
            type: types.ADDRESS_NEW_SET_ERROR,
            button: true,
            error: ''
          })
        }
      }

      dispatch({
        type: types.ADDRESS_NEW_SET_ACCOUNT,
        account
      })
    } else {
      if (!invalid) {
        dispatch({
          type: types.ADDRESS_NEW_SET_ERROR,
          button: false,
          error: 'invalid'
        })
      }
    }
  }
}

export const addressNewToggleDialog = () => {
  return (dispatch, getState) => {
    dispatch({
      type: types.ADDRESS_NEW_TOGGLE_DIALOG
    })

    if (getState().ui.addressNew.dialogOpen) {
      dispatch(addressNewSetAccount(getState().addressBook.showAccount))
    }
  }
}

export const addressNewToggleSnackbar = () => ({
  type: types.ADDRESS_NEW_TOGGLE_SNACKBAR
})
