import * as types from '../constants/ActionTypes'

const initialState = {
  button: true,
  dialogOpen: false,
  errors: {
    incorrect: false,
    missing: false
  },
  passphrase: '',
  snackbarOpen: false
}

const walletUnlock = (state = initialState, action) => {
  switch (action.type) {
    case types.WALLET_UNLOCK_SET_ERROR:
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

    case types.WALLET_UNLOCK_SET_PASSPHRASE:
      return {
        ...state,
        passphrase: action.passphrase
      }

    case types.WALLET_UNLOCK_TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: !state.dialogOpen
      }

    case types.WALLET_UNLOCK_TOGGLE_SNACKBAR:
      return {
        ...state,
        snackbarOpen: !state.snackbarOpen
      }

    default:
      return state
  }
}

export default walletUnlock
