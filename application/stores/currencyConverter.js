import { action, autorun, observable } from 'mobx'

/** Required store instances. */
import rates from './rates'

class CurrencyConverter {
  @observable bitcoin
  @observable local
  @observable vcash

  /**
   * Prepare observable variables.
   * @constructor
   * @property {number} bitcoin - Amount in bitcoin.
   * @property {number} local - Amount in local.
   * @property {number} vcash - Amount in Vcash
   */
  constructor() {
    this.convertFrom = 'vcash'
    this.bitcoin = 0
    this.local = 0
    this.vcash = 0

    this.setAmount(1, 'vcash')
    this.refresh()
  }

  /**
   * Set amount and currency to convert from.
   * @function setAmount
   * @param {number} amount - Amount to convert.
   * @param {string} convertFrom - Currency to convert from.
   */
  @action setAmount(amount, convertFrom) {
    if (!amount) {
      this.setData({
        convertFrom: '',
        bitcoin: '',
        local: '',
        vcash: ''
      })
    }

    /** Check if value is in 0000000[.,]00000000 format. */
    if (amount.toString().match(/^\d{0,7}(?:\.\d{0,8})?$/) || amount.toString().match(/^\d{0,7}(?:,\d{0,8})?$/)) {
      this.convertFrom = convertFrom
      this[convertFrom] = amount
      this.convert()
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

  /**
   * Convert from provided currency.
   * @function convert
   */
  convert() {
    switch (this.convertFrom) {
      case 'bitcoin':
        return this.setData({
          local: parseFloat(this[this.convertFrom] * rates.local).toFixed(3),
          vcash: parseFloat(this[this.convertFrom] / rates.average).toFixed(6)
        })

      case 'local':
        return this.setData({
          bitcoin: parseFloat(1 / rates.local * this[this.convertFrom]).toFixed(8),
          vcash: parseFloat((1 / rates.local * this[this.convertFrom]) / rates.average).toFixed(6)
        })

      case 'vcash':
        return this.setData({
          bitcoin: parseFloat(this[this.convertFrom] * rates.average).toFixed(8),
          local: parseFloat(this[this.convertFrom] * rates.local * rates.average).toFixed(3)
        })
    }
  }

  /**
   * Convert again when rates refresh.
   * @function refresh
   */
  refresh() {
    autorun(() => {
      let average = rates.average
      let local = rates.local
      this.convert()
    })
  }
}

const currencyConverter = new CurrencyConverter()

export default currencyConverter
export { CurrencyConverter }
