import * as types from '../constants/ActionTypes'

const initialState = {
  inBitcoin: '',
  inLocal: '',
  inVcash: ''
}

const convert = (state, action) => {
  switch (action.convertFrom) {
    case 'bitcoin':
      return {
        inBitcoin: action.amount,
        inLocal: parseFloat(action.amount * action.localRate).toFixed(3),
        inVcash: parseFloat(action.amount / action.exchangeRate).toFixed(6)
      }

    case 'local':
      return {
        inBitcoin: parseFloat(1 / action.localRate * action.amount).toFixed(8),
        inLocal: action.amount,
        inVcash: parseFloat((1 / action.localRate * action.amount) / action.exchangeRate).toFixed(6)
      }

    case 'vcash':
      return {
        inBitcoin: parseFloat(action.amount * action.exchangeRate).toFixed(8),
        inLocal: parseFloat(action.amount * action.localRate * action.exchangeRate).toFixed(3),
        inVcash: action.amount
      }

    default:
      return state
  }
}

const currencyConverter = (state = initialState, action) => {
  switch (action.type) {
    case types.CURRENCY_CONVERTER:
      return {
        ...state,
        ...convert(undefined, action)
      }

    case types.CURRENCY_CONVERTER_CLEAR:
      return {
        ...initialState
      }

    default:
      return state
  }
}

export default currencyConverter
