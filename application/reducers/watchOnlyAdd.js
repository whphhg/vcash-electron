import * as types from '../constants/ActionTypes'

const initialState = {
  address: '',
  button: false,
  dialogOpen: false,
  errors: {
    alreadyAdded: false,
    missing: true,
    invalid: false,
    isMine: false
  },
  note: '',
  snackbarOpen: false
}

const watchOnlyAdd = (state = initialState, action) => {
  switch (action.type) {
    case types.WATCHONLY_ADD_SET_ADDRESS:
      return {
        ...state,
        address: action.address
      }

    case types.WATCHONLY_ADD_SET_ERROR:
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

    case types.WATCHONLY_ADD_SET_NOTE:
      return {
        ...state,
        note: action.note
      }

    case types.WATCHONLY_ADD_TOGGLE_DIALOG:
      return {
        ...state,
        dialogOpen: !state.dialogOpen
      }

    case types.WATCHONLY_ADD_TOGGLE_SNACKBAR:
      return {
        ...state,
        snackbarOpen: !state.snackbarOpen
      }

    default:
      return state
  }
}

export default watchOnlyAdd
