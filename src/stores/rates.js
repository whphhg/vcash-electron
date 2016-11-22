import { action, computed, observable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'

class Rates {
  /**
   * Observable properties.
   * @property {string} localCurrency - Selected local currency.
   * @property {object} bitcoinAverage - Bitcoin average price index.
   * @property {object} poloniex - Poloniex ticker.
   * @property {object} bittrex - Bittrex ticker.
   */
  @observable localCurrency = getItem('localCurrency') || 'EUR'
  @observable bitcoinAverage = {}
  @observable poloniex = { last: 0 }
  @observable bittrex = { Last: 0 }

  constructor() {
    /** Start update loops. */
    this.fetchBitcoinAverage()
    this.fetchPoloniex()
    this.fetchBittrex()
  }

  /**
   * Get current Vcash price average.
   * @function average
   * @return {number} Vcash price average.
   */
  @computed get average() {
    const rates = [this.poloniex.last, this.bittrex.Last]
    const result = rates.reduce((result, rate) => {
      rate = parseFloat(rate)

      if (rate > 0) {
        result.total += rate
        result.divideBy += 1
      }

      return result
    }, { total: 0, divideBy: 0 })

    if (result.total > 0) return result.total / result.divideBy
    return 0
  }

  /**
   * Get current local bitcoin price.
   * @function local
   * @return {number} Local bitcoin price.
   */
  @computed get local() {
    if (this.bitcoinAverage.hasOwnProperty(this.localCurrency) === true) return this.bitcoinAverage[this.localCurrency].last
    return 0
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
   * Set bitcoin average price index.
   * @function setBitcoinAverage
   * @param {string} priceIndex - Price index.
   */
  @action setBitcoinAverage(priceIndex) {
    delete priceIndex.timestamp
    this.bitcoinAverage = priceIndex
  }

  /**
   * Set Poloniex ticker.
   * @function setPoloniex
   * @param {string} ticker - Ticker.
   */
  @action setPoloniex(ticker) {
    this.poloniex = ticker['BTC_XVC']
  }

  /**
   * Set Bittrex ticker.
   * @function setBittrex
   * @param {string} ticker - Ticker.
   */
  @action setBittrex(ticker) {
    this.bittrex = ticker.result[0]
  }

  /**
   * Set local currency and save to localStorage.
   * @function setLocalCurrency
   * @param {string} localCurrency - Local currency.
   */
  @action setLocalCurrency(localCurrency) {
    this.localCurrency = localCurrency
    setItem('localCurrency', localCurrency)
  }

  /**
   * Fetch BitcoinAverage price index.
   * @function fetchBitcoinAverage
   */
  fetchBitcoinAverage() {
    fetch('https://api.bitcoinaverage.com/ticker/global/all')
      .then((response) => { if (response.ok) return response.json() })
      .then((priceIndex) => { this.setBitcoinAverage(priceIndex) })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://api.bitcoinaverage.com/ticker/global/all:', error.message) })
    setTimeout(() => { this.fetchBitcoinAverage() }, 120 * 1000)
  }

  /**
   * Fetch Poloniex ticker.
   * @function fetchPoloniex
   */
  fetchPoloniex() {
    fetch('https://poloniex.com/public?command=returnTicker')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setPoloniex(ticker) })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://poloniex.com/public?command=returnTicker:', error.message) })
    setTimeout(() => { this.fetchPoloniex() }, 30 * 1000)
  }

  /**
   * Fetch Bittrex ticker.
   * @function fetchBittrex
   */
  fetchBittrex() {
    fetch('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-xvc')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setBittrex(ticker) })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-xvc:', error.message) })
    setTimeout(() => { this.fetchBittrex() }, 60 * 1000)
  }
}

/** Initialize a new globally used store. */
const rates = new Rates()

/** Export both, initialized store as default export, and store class as named export. */
export default rates
export { Rates }
