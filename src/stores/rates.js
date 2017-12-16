import { action, computed, extendObservable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'

/** Store instance */
import gui from './gui'

class Rates {
  /**
   * @prop {object} bitcoinAverage - Bitcoin average price index.
   * @prop {object} bittrex - Bittrex XVC ticker.
   * @prop {object} poloniex - Poloniex XVC ticker.
   */
  constructor() {
    extendObservable(this, {
      bitcoinAverage: getItem('bitcoinAverage') || { rates: {}, updated: 0 },
      bittrex: { Last: 0 },
      poloniex: { last: 0 }
    })

    /** Start the update loops. */
    this.fetchBitcoinAverage()
    this.fetchBittrex()
    this.fetchPoloniex()
  }

  /**
   * Get the current Vcash price average.
   * @function average
   * @return {number} Vcash price average.
   */
  @computed
  get average() {
    const rates = [this.bittrex.Last, this.poloniex.last]

    const result = rates.reduce(
      (result, rate) => {
        rate = parseFloat(rate)

        if (rate > 0) {
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
   * Get current local bitcoin price.
   * @function local
   * @return {number} Local bitcoin price.
   */
  @computed
  get local() {
    if (gui.localCurrency in this.bitcoinAverage.rates === true) {
      return this.bitcoinAverage.rates[gui.localCurrency]
    }

    return 0
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
   */
  async fetchBitcoinAverage() {
    if (new Date().getTime() - this.bitcoinAverage.updated > 15 * 59 * 1000) {
      try {
        let res = await window.fetch(
          'https://apiv2.bitcoinaverage.com/indices/global/ticker/short?crypto=BTC'
        )

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
      let res = await window.fetch(
        'https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-xvc'
      )

      res = await res.json()
      this.setBittrex(res)
    } catch (error) {
      console.error('Bittrex:', error.message)
    }

    setTimeout(() => this.fetchBittrex(), 60 * 1000)
  }

  /**
   * Fetch Poloniex ticker.
   * @function fetchPoloniex
   */
  async fetchPoloniex() {
    try {
      let res = await window.fetch(
        'https://poloniex.com/public?command=returnTicker'
      )

      res = await res.json()
      this.setPoloniex(res)
    } catch (error) {
      console.error('Poloniex:', error.message)
    }

    setTimeout(() => this.fetchPoloniex(), 60 * 1000)
  }
}

/** Initialize a new globally used store. */
const rates = new Rates()

/** Export initialized store as default export & store class as named export. */
export default rates
export { Rates }
