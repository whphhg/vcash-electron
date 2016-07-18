import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

const equalCheck = () => {
  return (dispatch, getState) => {
    const passphrase = getState().ui.walletEncrypt.passphrase
    const passphraseLength = passphrase.length
    const repeat = getState().ui.walletEncrypt.repeat
    const repeatLength = repeat.length

    if (passphraseLength === 0 || repeatLength === 0 || passphraseLength !== repeatLength) {
      if (getState().ui.walletEncrypt.errors.missing === false) {
        dispatch({
          type: types.WALLET_ENCRYPT_SET_ERROR,
          button: false,
          error: 'missing'
        })
      }

      return
    }

    if (passphrase === repeat) {
      dispatch({
        type: types.WALLET_ENCRYPT_SET_ERROR,
        button: true,
        error: ''
      })
    } else {
      if (getState().ui.walletEncrypt.errors.different === false) {
        dispatch({
          type: types.WALLET_ENCRYPT_SET_ERROR,
          button: false,
          error: 'different'
        })
      }
    }
  }
}

export const walletEncrypt = () => {
  return (dispatch, getState) => {
    const passphrase = getState().ui.walletEncrypt.passphrase
    const repeat = getState().ui.walletEncrypt.repeat
    const options = {
      method: 'encryptwallet',
      params: [passphrase]
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        dispatch(walletEncryptToggleDialog())
        dispatch(walletEncryptToggleSnackbar())
        dispatch({
          type: types.WALLET_ENCRYPT
        })
      }
    })
  }
}

export const walletEncryptSetPassphrase = (passphrase) => {
  return (dispatch, getState) => {
    dispatch({
      type: types.WALLET_ENCRYPT_SET_PASSPHRASE,
      passphrase
    })

    dispatch(equalCheck())
  }
}

export const walletEncryptSetRepeat = (repeat) => {
  return (dispatch, getState) => {
    dispatch({
      type: types.WALLET_ENCRYPT_SET_REPEAT,
      repeat
    })

    dispatch(equalCheck())
  }
}


export const walletEncryptToggleDialog = () => {
  return (dispatch, getState) => {
    dispatch({
      type: types.WALLET_ENCRYPT_TOGGLE_DIALOG
    })

    if (getState().ui.walletEncrypt.dialogOpen) {
      dispatch(walletEncryptSetPassphrase(''))
      dispatch(walletEncryptSetRepeat(''))
    }
  }
}

export const walletEncryptToggleSnackbar = () => ({
  type: types.WALLET_ENCRYPT_TOGGLE_SNACKBAR
})
