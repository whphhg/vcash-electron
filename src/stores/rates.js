import { action, computed, observable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'

/** Rates store class. */
class Rates {
  @observable localCurrency
  @observable bitcoinAverage
  @observable poloniex
  @observable bittrex
  @observable rawx

  /**
   * @constructor
   * @property {string} localCurrency - Selected local currency.
   * @property {object} bitcoinAverage - Bitcoin average price index.
   * @property {object} poloniex - Poloniex ticker.
   * @property {object} bittrex - Bittrex ticker.
   * @property {object} rawx - Rawx ticker.
   */
  constructor() {
    this.localCurrency = getItem('localCurrency') || 'EUR'
    this.bitcoinAverage = {}
    this.poloniex = { last: 0 }
    this.bittrex = { Last: 0 }
    this.rawx = { lastprice: 0 }

    /** Start rates update loops. */
    this.fetchBitcoinAverage()
    this.fetchPoloniex()
    this.fetchBittrex()
    this.fetchRawx()
  }

  /**
   * Get current Vcash price average.
   * @function average
   * @return {number} Vcash price average.
   */
  @computed get average() {
    const rates = [this.poloniex.last, this.bittrex.Last, this.rawx.lastprice]
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
    if (this.localCurrency in this.bitcoinAverage === true) return this.bitcoinAverage[this.localCurrency].last
    return 0
  }

  /**
   * Get local currencies.
   * @function localCurrencies
   * @return {array} Local currencies.
   */
  @computed get localCurrencies() { return Object.keys(this.bitcoinAverage) }

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
  @action setPoloniex(ticker) { this.poloniex = ticker['BTC_XVC'] }

  /**
   * Set Bittrex ticker.
   * @function setBittrex
   * @param {string} ticker - Ticker.
   */
  @action setBittrex(ticker) { this.bittrex = ticker.result[0] }

  /**
   * Set Rawx ticker.
   * @function setRawx
   * @param {string} ticker - Ticker.
   */
  @action setRawx(ticker) {
    for (let i in ticker.pairs) {
      if (ticker.pairs[i].other === 'XVC') {
        const internalDecimals = Math.pow(10, 12)

        ticker.pairs[i].lastprice = parseInt('0x' + ticker.pairs[i].lastprice) / internalDecimals
        ticker.pairs[i].volume = parseInt('0x' + ticker.pairs[i].volume) / internalDecimals
        ticker.pairs[i].bestask = parseInt('0x' + ticker.pairs[i].bestask) / internalDecimals
        ticker.pairs[i].bestbid = parseInt('0x' + ticker.pairs[i].bestbid) / internalDecimals
        ticker.pairs[i].minbase = parseInt('0x' + ticker.pairs[i].minbase) / internalDecimals
        ticker.pairs[i].depthbid = parseInt('0x' + ticker.pairs[i].depthbid) / internalDecimals

        this.rawx = ticker.pairs[i]
        break
      }
    }
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

  /**
   * Fetch Rawx ticker.
   * @function fetchRawx
   */
  fetchRawx() {
    fetch('https://beta.rawx.io/m')
      .then((response) => { if (response.ok) return response.json() })
      .then((ticker) => { this.setRawx(ticker) })
      .catch((error) => { process.env.NODE_ENV === 'dev' && console.error('https://beta.rawx.io/m:', error.message) })
    setTimeout(() => { this.fetchRawx() }, 60 * 1000)
  }
}

/** Initialize a new globally used store. */
const rates = new Rates()

/** Export both, initialized store as default export, and store class as named export. */
export default rates
export { Rates }
