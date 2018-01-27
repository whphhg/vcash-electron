import { action, computed, extendObservable, reaction } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage.js'
import { bitcoinAverage, bittrex, poloniex } from '../utilities/constants.js'

/** Store instance */
import gui from './gui.js'

class Rates {
  /**
   * @prop {object} timeouts - Update loops timeouts.
   * @prop {object} exchanges - Exchanges used in average rate calculation.
   * @prop {object} bitcoinAverage - Bitcoin average price index.
   * @prop {object} bittrex - Bittrex XVC ticker.
   * @prop {object} poloniex - Poloniex XVC ticker.
   */
  constructor() {
    this.timeouts = { bittrex: null, poloniex: null }

    /** Extend the store with observable properties. */
    extendObservable(this, {
      exchanges: getItem('exchanges') || { bittrex: true, poloniex: true },
      bitcoinAverage: getItem('bitcoinAverage') || { rates: {}, updated: 0 },
      bittrex: { Last: 0, updated: 0 },
      poloniex: { last: 0, updated: 0 }
    })

    /** Begin Bitcoin average update loop. */
    this.fetchBitcoinAverage()

    /** Begin enabled exchanges update loops. */
    Object.keys(this.exchanges).forEach(exchange => {
      if (this.exchanges[exchange] === true) this.fetchRate(exchange)
    })

    /** Auto-save exchanges settings to local storage with 3s delay. */
    reaction(
      () => {
        return Object.keys(this.exchanges).reduce((exchanges, exchange) => {
          exchanges[exchange] = this.exchanges[exchange]
          return exchanges
        }, {})
      },
      exchanges => setItem('exchanges', exchanges),
      {
        delay: 3 * 1000,
        name: 'Rates: auto-saving exchanges settings to local storage.'
      }
    )
  }

  /**
   * Get the current Vcash price average.
   * @function average
   * @return {number} Vcash price average.
   */
  @computed
  get average() {
    const rates = { bittrex: this.bittrex.Last, poloniex: this.poloniex.last }

    /** Get the sum of rates and count of enabled exchanges to divide by. */
    const result = Object.keys(rates).reduce(
      (result, exchange) => {
        const rate = parseFloat(rates[exchange])

        /** Increment total if the exchange is enabled and has updated rate. */
        if (this.exchanges[exchange] === true && rate > 0) {
          result.divideBy += 1
          result.total += rate
        }

        return result
      },
      { divideBy: 0, total: 0 }
    )

    if (result.total > 0) return result.total / result.divideBy
    return 0
  }

  /**
   * Get the number of enabled exchanges.
   * @function exchangesEnabled
   * @return {number} Enabled exchanges.
   */
  @computed
  get exchangesEnabled() {
    return Object.keys(this.exchanges).reduce((enabled, exchange) => {
      if (this.exchanges[exchange] === true) return enabled + 1
      return enabled
    }, 0)
  }

  /**
   * Get current local Bitcoin price.
   * @function local
   * @return {number} Local Bitcoin price.
   */
  @computed
  get local() {
    if (gui.localCurrency in this.bitcoinAverage.rates === false) return 0
    return this.bitcoinAverage.rates[gui.localCurrency]
  }

  /**
   * Get local currencies.
   * @function localCurrencies
   * @return {array} Local currencies.
   */
  @computed
  get localCurrencies() {
    return Object.keys(this.bitcoinAverage.rates)
  }

  /**
   * Toggle exchange being used in average rate calculation.
   * @function setExchange
   * @param {string} exchange - Exchange name (key).
   */
  @action
  setExchange(exchange) {
    /** Always have at least one exchange enabled. */
    if (this.exchangesEnabled === 1 && this.exchanges[exchange] === true) return

    /** Clear previous timeout. */
    clearTimeout(this.timeouts[exchange])

    /** Toggle the exchange and begin the update loop if it was toggled on. */
    this.exchanges[exchange] = !this.exchanges[exchange]
    if (this.exchanges[exchange] === true) this.fetchRate(exchange)
  }

  /**
   * Set bitcoin average price index and save it to local storage.
   * @function setBitcoinAverage
   * @param {object} priceIndex - Bitcoin average price index.
   */
  @action
  setBitcoinAverage(priceIndex) {
    /** Set only if rates is an object. */
    if (priceIndex === Object(priceIndex)) {
      this.bitcoinAverage = {
        rates: Object.keys(priceIndex).reduce((rates, ticker) => {
          rates[ticker.substr(3)] = priceIndex[ticker].last
          return rates
        }, {}),
        updated: new Date().getTime()
      }

      setItem('bitcoinAverage', this.bitcoinAverage)
    }
  }

  /**
   * Set Bittrex ticker.
   * @function setBittrex
   * @param {string} ticker - Ticker.
   */
  @action
  setBittrex(ticker) {
    /** Set only if ticker is an object and result exists. */
    if (ticker === Object(ticker) && 'result' in ticker === true) {
      this.bittrex = { ...ticker.result[0], updated: new Date() }
    }
  }

  /**
   * Set Poloniex ticker.
   * @function setPoloniex
   * @param {string} ticker - Ticker.
   */
  @action
  setPoloniex(ticker) {
    /** Set only if ticker is an object and BTC_XVC pair exists. */
    if (ticker === Object(ticker) && 'BTC_XVC' in ticker === true) {
      this.poloniex = { ...ticker['BTC_XVC'], updated: new Date() }
    }
  }

  /**
   * Fetch BitcoinAverage price index every 15 minutes
   * to obey the 100 requests per day limit.
   * @function fetchBitcoinAverage
   * @param {boolean} force - Force update, regardless of per day limit.
   */
  async fetchBitcoinAverage(force = false) {
    if (
      force === true ||
      new Date().getTime() - this.bitcoinAverage.updated > 15 * 59 * 1000
    ) {
      try {
        let res = await window.fetch(bitcoinAverage)
        res = await res.json()
        this.setBitcoinAverage(res)
      } catch (error) {
        console.error('BitcoinAverage:', error.message)
      }
    }

    setTimeout(() => this.fetchBitcoinAverage(), 15 * 60 * 1000)
  }

  /**
   * Fetch Bittrex ticker.
   * @function fetchBittrex
   */
  async fetchBittrex() {
    try {
      let res = await window.fetch(bittrex)
      res = await res.json()
      this.setBittrex(res)
    } catch (error) {
      console.error('Bittrex:', error.message)
    }

    this.timeouts.bittrex = setTimeout(() => this.fetchBittrex(), 60 * 1000)
  }

  /**
   * Fetch Poloniex ticker.
   * @function fetchPoloniex
   */
  async fetchPoloniex() {
    try {
      let res = await window.fetch(poloniex)
      res = await res.json()
      this.setPoloniex(res)
    } catch (error) {
      console.error('Poloniex:', error.message)
    }

    this.timeouts.poloniex = setTimeout(() => this.fetchPoloniex(), 60 * 1000)
  }

  /**
   * Fetch exchange rate.
   * @function fetchRate
   * @param {string} exchange - Exchange name (key).
   */
  fetchRate(exchange) {
    if (exchange === 'bittrex') return this.fetchBittrex()
    if (exchange === 'poloniex') return this.fetchPoloniex()
  }
}

/** Initialize a new globally used store. */
const rates = new Rates()

/** Export initialized store as default export & store class as named export. */
export default rates
export { Rates }
