import * as types from '../constants/ActionTypes'

export const setLocalCurrency = (localCurrency) => ({
  type: types.SET_LOCAL_CURRENCY,
  localCurrency
})
