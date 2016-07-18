import * as types from '../constants/ActionTypes'
import moment from 'moment'

const initialState = {
  confirmed: [],
  unconfirmed: [],
  unconfirmedTotal: 0,
  filterBy: [],
  showSince: new Date(moment().subtract(20, 'days').calendar()),
  showCategory: 'all'
}

const transactions = (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSACTIONS:
      return {
        ...state,
        confirmed: [
          ...state.confirmed,
          ...action.confirmed
        ],
        unconfirmed: action.unconfirmed,
        unconfirmedTotal: action.unconfirmedTotal
      }

    case types.TRANSACTIONS_SET_FILTER_BY:
      return {
        ...state,
        filterBy: action.filterBy
      }

    case types.TRANSACTIONS_SET_SHOW_CATEGORY:
      return {
        ...state,
        showCategory: action.showCategory
      }

    case types.TRANSACTIONS_SET_SHOW_SINCE:
      return {
        ...state,
        showSince: action.showSince
      }

    default:
      return state
  }
}

export default transactions
