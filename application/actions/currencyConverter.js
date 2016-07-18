import * as types from '../constants/ActionTypes'
import { decimalSeparator } from '../utilities/common'
import { getExchangeRate, getLocalRate } from '../selectors/rates'

export const currencyConverter = (event) => {
  return (dispatch, getState) => {
    const amount = event.target.value
    const convertFrom = event.target.id
    const exchangeRate = getExchangeRate(getState())
    const localRate = getLocalRate(getState())
    let update = true

    if (amount) {
      // Check if value is in 0000000[.,]00000000 format.
      switch (decimalSeparator()) {
        case '.':
          if (!amount.toString().match(/^\d{0,7}(?:\.\d{0,8})?$/)) {
            update = false
          }
        break

        case ',':
          if (!amount.toString().match(/^\d{0,7}(?:,\d{0,8})?$/)) {
            update = false
          }
        break
      }

      if (update) {
        dispatch({
          type: types.CURRENCY_CONVERTER,
          amount,
          convertFrom,
          exchangeRate,
          localRate
        })
      }
    } else {
      dispatch({
        type: types.CURRENCY_CONVERTER_CLEAR
      })
    }
  }
}
