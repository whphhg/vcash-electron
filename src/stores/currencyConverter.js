import { action, autorun, observable } from 'mobx'

/** Required store instances. */
import rates from './rates'

class CurrencyConverter {
  /**
   * Observable properties.
   * @property {string} convertFrom - Converting currency.
   * @property {number} vcash - Amount in vcash
   * @property {number} bitcoin - Amount in bitcoin.
   * @property {number} local - Amount in local.
   */
  @observable convertFrom = 'vcash'
  @observable vcash = 1
  @observable bitcoin = 0
  @observable local = 0

  constructor() {
    /** Convert amounts on changes to them or rates. */
    autorun(() => {
      let trackLocal = rates.localCurrency

      switch (this.convertFrom) {
        case 'vcash':
          return this.setData({
            bitcoin: Math.round((this[this.convertFrom] * rates.average) * 1e8) / 1e8,
            local: Math.round((this[this.convertFrom] * rates.local * rates.average) * 1e3) / 1e3
          })

        case 'bitcoin':
          return this.setData({
            local: Math.round((this[this.convertFrom] * rates.local) * 1e3) / 1e3,
            vcash: Math.round((this[this.convertFrom] / rates.average) * 1e6) / 1e6
          })

        case 'local':
          return this.setData({
            bitcoin: Math.round((this[this.convertFrom] * 1 / rates.local) * 1e8) / 1e8,
            vcash: Math.round(((this[this.convertFrom] * 1 / rates.local) / rates.average) * 1e6) / 1e6
          })
      }
    })
  }

  /**
   * Set amount and converting currency.
   * @function setAmount
   * @param {number} amount - Amount to convert.
   * @param {string} convertFrom - Converting currency.
   */
  @action setAmount(amount, convertFrom) {
    /** Check if value is in 0000000[.,]00000000 format. */
    if (amount.match(/^\d{0,7}(?:\.\d{0,8})?$/) !== null || amount.match(/^\d{0,7}(?:,\d{0,8})?$/) !== null) {
      this.convertFrom = convertFrom
      this[convertFrom] = amount
    }
  }

  /**
   * Set converted data.
   * @function setData
   * @param {object} Converted data.
   */
  @action setData(data) {
    for (let i in data) {
      this[i] = data[i]
    }
  }
}

/** Initialize a new globally used store. */
const currencyConverter = new CurrencyConverter()

/** Export both, initialized store as default export, and store class as named export. */
export default currencyConverter
export { CurrencyConverter }
