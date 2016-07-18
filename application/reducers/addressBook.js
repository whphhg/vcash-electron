import * as types from '../constants/ActionTypes'

const initialState = {
  accounts: [],
  byAccount: {
    '#All': {
      balance: 0
    },
    Default: {
      balance: 0,
      addresses: []
    }
  },
  showAccount: 'Default'
}

const addressBook = (state = initialState, action) => {
  switch (action.type) {
    case types.ADDRESS_BOOK:
      return {
        ...state,
        accounts: action.accounts,
        byAccount: action.byAccount
      }

    case types.ADDRESS_BOOK_SET_SHOW_ACCOUNT:
      return {
        ...state,
        showAccount: action.showAccount
      }

    default:
      return state
  }
}

export default addressBook
