import * as types from '../constants/ActionTypes'

const initialState = {
  button: false,
  dialogOpen: false,
  errors: {
    different: false,
    missing: true
  },
  passphrase: '',
  repeat: '',
  snackbarOpen: false
}

const walletEncrypt = (state = initialState, action) => {
  switch (action.type) {
    case types.WALLET_ENCRYPT_SET_ERROR:
      return {
        ...state,
        button: action.button,
        errors: Object.keys(state.errors).reduce((errors, error) => {
          if (action.error === error) {
            errors[error] = true
          } else {
            errors[error] = false
          }

          return errors
        }, {})
      }

    case types.WALLET_ENCRYPT_SET_PASSPHRASE:
      return {
        ...state,
        passphrase: action.passphrase
      }

    case types.WALLET_ENCRYPT_SET_REPEAT:
      return {
        ...state,
        repeat: action.repeat
      }

    case types.WALLET_ENCRYPT_TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: !state.dialogOpen
      }

    case types.WALLET_ENCRYPT_TOGGLE_SNACKBAR:
      return {
        ...state,
        snackbarOpen: !state.snackbarOpen
      }

    default:
      return state
  }
}

export default walletEncrypt
