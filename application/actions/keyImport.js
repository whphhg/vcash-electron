import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import { addressBook, addressBookSetShowAccount } from './addressBook'

const buttonCheck = () => {
  return (dispatch, getState) => {
    const errors = getState().ui.keyImport.errors
    const keys = Object.keys(errors)

    for (let key in keys) {
      for (let error in errors[keys[key]]) {
        if (errors[keys[key]][error]) {
          return dispatch({
            type: types.KEY_IMPORT_BUTTON_CHECK,
            button: false
          })
        }
      }
    }

    dispatch({
      type: types.KEY_IMPORT_BUTTON_CHECK,
      button: true
    })
  }
}

export const keyImport = () => {
  return (dispatch, getState) => {
    const account = getState().ui.keyImport.account
    const key = getState().ui.keyImport.privateKey
    const options = {
      method: 'importprivkey',
      params: [key, account === 'Default' ? '' : account]
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        if (response.hasOwnProperty('error')) {
          /**
           * error_code_wallet_error = -4 (already imported)
           * error_code_invalid_address_or_key = -5 (invalid key)
           */
          switch (response.error.code) {
            case -4:
              return dispatch({
                type: types.KEY_IMPORT_SET_ERROR,
                error: 'alreadyImported',
                errorType: 'key'
              })

            case -5:
              return dispatch({
                type: types.KEY_IMPORT_SET_ERROR,
                error: 'invalid',
                errorType: 'key'
              })
          }

          dispatch(buttonCheck())
        }

        dispatch(addressBook())
        dispatch(keyImportDialog())
        dispatch(keyImportSnackbar())

        if (getState().addressBook.showAccount !== account) {
          dispatch(addressBookSetShowAccount(account))
        }

        process.env.NODE_ENV === 'development' && console.info('RPC: Imported private key and assigned it to account "' + account + '".')
      }
    })
  }
}

export const keyImportSetAccount = (account) => {
  return (dispatch, getState) => {
    const isMatching = account.match(/^[a-zA-Z0-9 ]{0,100}$/)

    const invalid = getState().ui.keyImport.errors.account.invalid
    const missing = getState().ui.keyImport.errors.account.missing

    if (isMatching) {
      if (account.length === 0) {
        if (missing === false) {
          dispatch({
            type: types.KEY_IMPORT_SET_ERROR,
            error: 'missing',
            errorType: 'account'
          })

          dispatch(buttonCheck())
        }
      } else {
        if (missing || invalid) {
          dispatch({
            type: types.KEY_IMPORT_SET_ERROR,
            error: '',
            errorType: 'account'
          })

          dispatch(buttonCheck())
        }
      }

      dispatch({
        type: types.KEY_IMPORT_SET_ACCOUNT,
        account
      })
    } else {
      if (!invalid) {
        dispatch({
          type: types.KEY_IMPORT_SET_ERROR,
          error: 'invalid',
          errorType: 'account'
        })

        dispatch(buttonCheck())
      }
    }
  }
}

export const keyImportSetKey = (privateKey) => {
  return (dispatch, getState) => {
    const isMatching = privateKey.match(/^[a-zA-Z0-9]{0,52}$/)

    const alreadyImported = getState().ui.keyImport.errors.key.alreadyImported
    const incomplete = getState().ui.keyImport.errors.key.incomplete
    const invalid = getState().ui.keyImport.errors.key.invalid

    if (isMatching) {
      if (privateKey.length < 51) {
        if (incomplete === false) {
          dispatch({
            type: types.KEY_IMPORT_SET_ERROR,
            error: 'incomplete',
            errorType: 'key'
          })

          dispatch(buttonCheck())
        }
      } else {
        if (incomplete) {
          dispatch({
            type: types.KEY_IMPORT_SET_ERROR,
            error: '',
            errorType: 'key'
          })

          dispatch(buttonCheck())
        }
      }

      dispatch({
        type: types.KEY_IMPORT_SET_KEY,
        privateKey
      })
    }
  }
}

export const keyImportToggleDialog = () => {
  return (dispatch, getState) => {
    dispatch({
      type: types.KEY_IMPORT_TOGGLE_DIALOG
    })

    if (getState().ui.keyImport.dialogOpen) {
      dispatch(keyImportSetAccount(getState().addressBook.showAccount))
      dispatch(keyImportSetKey(''))
    }
  }
}

export const keyImportToggleSnackbar = () => ({
  type: types.KEY_IMPORT_TOGGLE_SNACKBAR
})
