import * as types from '../constants/ActionTypes'

const initialState = {
  account: 'Default',
  button: true,
  dialogOpen: false,
  errors: {
    invalid: false,
    missing: false
  },
  snackbarOpen: false
}

const addressNew = (state = initialState, action) => {
  switch (action.type) {
    case types.ADDRESS_NEW_SET_ACCOUNT:
      return {
        ...state,
        account: action.account
      }

    case types.ADDRESS_NEW_SET_ERROR:
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

    case types.ADDRESS_NEW_TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: !state.dialogOpen
      }

    case types.ADDRESS_NEW_TOGGLE_SNACKBAR:
      return {
        ...state,
        snackbarOpen: !state.snackbarOpen
      }

    default:
      return state
  }
}

export default addressNew
