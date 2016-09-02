import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** KeyDump store class. */
class KeyDump {
  @observable address
  @observable privateKey
  @observable button
  @observable dialog
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} address - Address to dump the private key of.
   * @property {string} privateKey - Dumped private key.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} dialog - Dialog open status.
   * @property {object} errors - Error statuses.
   * @property {boolean} errors.doesntBelong - Address doesn't belong to this wallet.
   * @property {boolean} errors.invalidAddress - Incorrect address entered.
   * @property {boolean} errors.missing - Missing address.
   */
  constructor() {
    this.address = ''
    this.privateKey = ''
    this.button = false
    this.dialog = false
    this.errors = {
      doesntBelong: false,
      invalidAddress: false,
      missing: true,
    }
  }

  /**
   * Set error and button.
   * @function setError
   * @param {string} error - Error key.
   */
  @action setError(error) {
    let button = true

    for (let i in this.errors) {
      if (error === i) {
        this.errors[i] = true
        button = false
      } else {
        this.errors[i] = false
      }
    }

    this.button = button
  }

  /**
   * Set address.
   * @function setAddress
   * @param {string} address - String containing address.
   */
  @action setAddress(address) {
    if (address.match(/^[a-zA-Z0-9]{0,34}$/)) {
      this.address = address

      if (address.length === 34) {
        this.setError('')
      } else {
        if (this.errors.missing === false) {
          this.setError('missing')
        }
      }
    } else {
      if (this.errors.invalidAddress === false) {
        this.setError('invalidAddress')
      }
    }

    /** Clear private key when changing address. */
    if (this.privateKey !== '') {
      this.setPrivateKey('')
    }
  }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Returned private key.
   */
  @action setPrivateKey(privateKey) {
    this.privateKey = privateKey
  }

  /**
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    /** Reset entered address and private key. */
    this.setAddress('')
    this.setPrivateKey('')
  }

  /**
   * Dump private key.
   * @function dumpprivkey
   */
  dumpprivkey() {
    rpc({ method: 'dumpprivkey', params: [this.address] }, (response) => {
      if (response !== null) {
        if (response.hasOwnProperty('error')) {
          /**
           * error_code_wallet_error = -4 (address doesn't belong to this wallet)
           * error_code_invalid_address_or_key = -5 (invalid address)
           */
          switch (response.error.code) {
            case -4:
              return this.setError('doesntBelong')

            case -5:
              return this.setError('invalidAddress')
          }
        }

        this.setPrivateKey(response.result)
      }
    })
  }
}

const keyDump = new KeyDump()

export default keyDump
export { KeyDump }
