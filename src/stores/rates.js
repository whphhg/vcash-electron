import { action, computed, observable } from 'mobx'

/** Required stores. */
import gui from './gui'

class Rates {
  /**
   * Observable properties.
   * @property {object} bitcoinAverage - Bitcoin average price index.
   * @property {object} poloniex - Poloniex ticker.
   * @property {object} bittrex - Bittrex ticker.
   */
  @observable bitcoinAverage = {}
  @observable poloniex = { last: 0 }
  @observable bittrex = { Last: 0 }

  /**
   * Start upate loops.
   * @constructor
   */
  constructor () {
    this.fetchBitcoinAverage()
    this.fetchPoloniex()
    this.fetchBittrex()
  }

  /**
   * Get current Vcash price average.
   * @function average
   * @return {number} Vcash price average.
   */
  @computed get average () {
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
  @computed get local () {
    if (this.bitcoinAverage.hasOwnProperty(gui.localCurrency) === true) {
      return this.bitcoinAverage[gui.localCurrency].last
    }

    return 0
  }

  /**
   * Get local currencies.
   * @function localCurrencies
   * @return {array} Local currencies.
   */
  @computed get localCurrencies () {
    return Object.keys(this.bitcoinAverage)
  }

  /**
   * Set bitcoin average price index.
   * @function setBitcoinAverage
   * @param {string} priceIndex - Price index.
   */
  @action setBitcoinAverage (priceIndex) {
    delete priceIndex.timestamp
    this.bitcoinAverage = priceIndex
  }

  /**
   * Set Poloniex ticker.
   * @function setPoloniex
   * @param {string} ticker - Ticker.
   */
  @action setPoloniex (ticker) {
    this.poloniex = ticker['BTC_XVC']
  }

  /**
   * Set Bittrex ticker.
   * @function setBittrex
   * @param {string} ticker - Ticker.
   */
  @action setBittrex (ticker) {
    this.bittrex = ticker.result[0]
  }

  /**
   * Fetch BitcoinAverage price index every 15 minutes to obey the
   * 100 requests per day limit.
   * @function fetchBitcoinAverage
   */
  fetchBitcoinAverage () {
    window.fetch('https://apiv2.bitcoinaverage.com/ticker/global/all')
      .then((response) => { if (response.ok) return response.json() })
      .then((priceIndex) => { this.setBitcoinAverage(priceIndex) })
      .catch((error) => { console.error('BitcoinAverage:', error.message) })
    setTimeout(() => { this.fetchBitcoinAverage() }, 900 * 1000)
  }

  /**
   * Fetch Poloniex ticker.
   * @function fetchPoloniex
   */
  fetchPoloniex () {
    window.fetch('https://poloniex.com/public?command=returnTicker')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setPoloniex(ticker) })
      .catch((error) => { console.error('Poloniex:', error.message) })
    setTimeout(() => { this.fetchPoloniex() }, 30 * 1000)
  }

  /**
   * Fetch Bittrex ticker.
   * @function fetchBittrex
   */
  fetchBittrex () {
    window.fetch('https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-xvc')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setBittrex(ticker) })
      .catch((error) => { console.error('Bittrex:', error.message) })
    setTimeout(() => { this.fetchBittrex() }, 60 * 1000)
  }
}

/** Initialize a new globally used store. */
const rates = new Rates()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default rates
export { Rates }
