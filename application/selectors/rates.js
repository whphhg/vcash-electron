import { createSelector } from 'reselect'

const getBitcoinAverage = (state) => state.rates.bitcoinAverage.list
const getBittrexLast = (state) => state.rates.bittrex.last
const getLocalCurrency = (state) => state.settings.localCurrency
const getPoloniexLast = (state) => state.rates.poloniex.last

export const getExchangeRate = createSelector([getPoloniexLast, getBittrexLast], (poloniex, bittrex) => {
  const rates = [poloniex, bittrex]
  let total = 0
  let divideBy = 0

  rates.map((rate) => {
    if (rate > 0) {
      total += parseFloat(rate)
      divideBy += 1
    }
  })

  if (isNaN(total / divideBy)) {
    return 0
  }

  return parseFloat(total / divideBy)
})

export const getLocalCurrencies = createSelector([getBitcoinAverage], (localRates) => {
  return Object.keys(localRates)
})

export const getLocalRate = createSelector([getBitcoinAverage, getLocalCurrency], (rates, localCurrency) => {
  if (localCurrency in rates) {
    return rates[localCurrency].last
  } else {
    return 0
  }
})
