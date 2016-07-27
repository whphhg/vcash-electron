import { action, computed, observable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'

/** Rates store class. */
class Rates {
  @observable bitcoinAverage
  @observable bittrex
  @observable localCurrency
  @observable poloniex

  /**
   * Prepare observable variables and run fetching functions.
   * @constructor
   * @property {string} localCurrency - User selected local currency.
   * @property {object} bitcoinAverage - Bitcoin average price index.
   * @property {object} bittrex - Bittrex ticker.
   * @property {object} poloniex - Poloniex ticker.
   */
  constructor() {
    this.localCurrency = getItem('localCurrency') || 'EUR'

    this.bitcoinAverage = {}
    this.bittrex = { Last: 0 }
    this.poloniex = { last: 0 }

    this.fetchBitcoinAverage()
    this.fetchBittrex()
    this.fetchPoloniex()
  }

  /**
   * Set bitcoin average price index.
   * @function setBitcoinAverage
   * @param {string} priceIndex - New price index.
   */
  @action setBitcoinAverage(priceIndex) {
    this.bitcoinAverage = priceIndex
  }

  /**
   * Set Bittrex ticker.
   * @function setBittrex
   * @param {string} ticker - Bittrex ticker.
   */
  @action setBittrex(ticker) {
    this.bittrex = ticker
  }

  /**
   * Set provided local currency and save to localStorage.
   * @function setLocalCurrency
   * @param {string} localCurrency - Provided local currency.
   */
  @action setLocalCurrency(localCurrency) {
    this.localCurrency = localCurrency
    setItem('localCurrency', localCurrency)
  }

  /**
   * Set Poloniex ticker.
   * @function setPoloniex
   * @param {string} ticker - Poloniex ticker.
   */
  @action setPoloniex(ticker) {
    this.poloniex = ticker
  }

  /**
   * Get current Vcash price average.
   * @function average
   * @return {number} Vcash price average.
   */
  @computed get average() {
    const rates = [this.poloniex.last, this.bittrex.Last]
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
  }

  /**
   * Get current local bitcoin price.
   * @function local
   * @return {number} Local bitcoin price.
   */
  @computed get local() {
    if (this.localCurrency in this.bitcoinAverage) {
      return this.bitcoinAverage[this.localCurrency].last
    } else {
      return 0
    }
  }

  /**
   * Get local currencies.
   * @function localCurrencies
   * @return {array} Local currencies.
   */
  @computed get localCurrencies() {
    return Object.keys(this.bitcoinAverage)
  }

  /**
   * Fetch bitcoin average price index.
   * @function fetchBitcoinAverage
   */
  fetchBitcoinAverage() {
    fetch('https://api.bitcoinaverage.com/ticker/global/all')
      .then((response) => { if (response.ok) return response.json() })
      .then((priceIndex) => {
        delete priceIndex.timestamp
        this.setBitcoinAverage(priceIndex)
      })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://api.bitcoinaverage.com/ticker/global/all:', error.message) })

    setTimeout(() => { this.fetchBitcoinAverage() }, 120 * 1000)
  }

  /**
   * Fetch Bittrex ticker.
   * @function fetchBittrex
   */
  fetchBittrex() {
    fetch('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-xvc')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setBittrex(ticker.result[0]) })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-xvc:', error.message) })

    setTimeout(() => { this.fetchBittrex() }, 60 * 1000)
  }

  /**
   * Fetch Poloniex ticker.
   * @function fetchPoloniex
   */
  fetchPoloniex() {
    fetch('https://poloniex.com/public?command=returnTicker')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setPoloniex(ticker['BTC_XVC']) })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://poloniex.com/public?command=returnTicker:', error.message) })

    setTimeout(() => { this.fetchPoloniex() }, 30 * 1000)
  }
}

const rates = new Rates()

export default rates
export { Rates }
