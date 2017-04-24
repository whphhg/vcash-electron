import { action, computed, observable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'

/** Required store instances. */
import gui from './gui'

class Rates {
  /**
   * Observable properties.
   * @property {object} bitcoinAverage - Bitcoin average price index.
   * @property {object} poloniex - Poloniex ticker.
   * @property {object} bittrex - Bittrex ticker.
   */
  @observable bitcoinAverage = getItem('bitcoinAverage') || { rates: {}, updated: 0 }
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
    if (this.bitcoinAverage.rates.hasOwnProperty(gui.localCurrency) === true) {
      return this.bitcoinAverage.rates[gui.localCurrency].last
    }

    return 0
  }

  /**
   * Get local currencies.
   * @function localCurrencies
   * @return {array} Local currencies.
   */
  @computed get localCurrencies () {
    return Object.keys(this.bitcoinAverage.rates)
  }

  /**
   * Set bitcoin average price index.
   * @function setBitcoinAverage
   * @param {string} rates - Price index.
   */
  @action setBitcoinAverage (rates) {
    this.bitcoinAverage = { rates, updated: new Date().getTime() }

    /** Save to local storage. */
    setItem('bitcoinAverage', this.bitcoinAverage)
  }

  /**
   * Set Poloniex ticker.
   * @function setPoloniex
   * @param {string} ticker - Ticker.
   */
  @action setPoloniex (ticker) {
    this.poloniex = { ...ticker['BTC_XVC'], updated: new Date() }
  }

  /**
   * Set Bittrex ticker.
   * @function setBittrex
   * @param {string} ticker - Ticker.
   */
  @action setBittrex (ticker) {
    this.bittrex = { ...ticker.result[0], updated: new Date() }
  }

  /**
   * Fetch BitcoinAverage price index every 15 minutes to obey the
   * 100 requests per day limit.
   * @function fetchBitcoinAverage
   */
  fetchBitcoinAverage () {
    if (new Date().getTime() - this.bitcoinAverage.updated > 15 * 59 * 1000) {
      window.fetch('https://apiv2.bitcoinaverage.com/ticker/global/all')
        .then((response) => { if (response.ok) return response.json() })
        .then((priceIndex) => { this.setBitcoinAverage(priceIndex) })
        .catch((error) => { console.error('BitcoinAverage:', error.message) })
    }

    setTimeout(() => { this.fetchBitcoinAverage() }, 15 * 60 * 1000)
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
