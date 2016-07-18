import * as types from '../constants/ActionTypes'

const initialState = {
  account: 'Default',
  button: false,
  dialogOpen: false,
  errors: {
    account: {
      invalid: false,
      missing: false
    },
    key: {
      alreadyImported: false,
      incomplete: true,
      invalid: false
    }
  },
  privateKey: '',
  snackbarOpen: false
}

const keyImport = (state = initialState, action) => {
  switch (action.type) {
    case types.KEY_IMPORT_BUTTON_CHECK:
      return {
        ...state,
        button: action.button
      }

    case types.KEY_IMPORT_SET_ACCOUNT:
      return {
        ...state,
        account: action.account
      }

    case types.KEY_IMPORT_SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.errorType]: {
            ...Object.keys(state.errors[action.errorType]).reduce((errors, error) => {
              if (action.error === error) {
                errors[error] = true
              } else {
                errors[error] = false
              }

              return errors
            }, {})
          }
        }
      }

    case types.KEY_IMPORT_SET_KEY:
      return {
        ...state,
        privateKey: action.privateKey
      }

    case types.KEY_IMPORT_TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: !state.dialogOpen
      }

    case types.KEY_IMPORT_TOGGLE_SNACKBAR:
      return {
        ...state,
        snackbarOpen: !state.snackbarOpen
      }

    default:
      return state
  }
}

export default keyImport
