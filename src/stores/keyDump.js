import { action, autorun, computed, observable } from 'mobx'

/** Required store instances. */
import rpc from './rpc'

/** KeyDump store class. */
class KeyDump {
  @observable address
  @observable privateKey
  @observable popover
  @observable errors

  /**
   * @constructor
   * @property {string} address - Form element input value.
   * @property {string} privateKey - Dumped private key.
   * @property {boolean} popover - Popover visibility status.
   * @property {object} errors - Form input errors.
   */
  constructor() {
    this.address = ''
    this.privateKey = ''
    this.popover = false
    this.errors = {
      invalidCharacters: false,
      invalidAddress: false,
      unknownAddress: false
    }

    /** Auto validate address on every change. */
    autorun(() => {
      if (this.address.match(/^[a-zA-Z0-9]{0,34}$/) === null) {
        if (this.errors.invalidCharacters === false) {
          this.setError('invalidCharacters')
        }
      } else {
        if (this.errors.invalidCharacters === true) {
          this.setError('invalidCharacters')
        }
      }
    })

    /** Auto clear entered address and private key when popover closes. */
    autorun(() => {
      if (this.popover === false) {
        this.setAddress()
        this.setPrivateKey()
      }
    })
  }

  /**
   * Dump private key.
   * @function dumpprivkey
   */
  dumpprivkey() {
    rpc.call([{ method: 'dumpprivkey', params: [this.address] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Unknown address: error_code_wallet_error = -4 */
            case -4:
              return this.setError('unknownAddress')

            /** Invalid address: error_code_invalid_address_or_key = -5 */
            case -5:
              return this.setError('invalidAddress')
          }
        }

        this.setPrivateKey(response[0].result)
      }
    })
  }

  /**
   * Get form submit button status.
   * @function button
   * @return {boolean} Button status.
   */
  @computed get button() {
    /** Do not allow submitting less than full-length addresses. */
    if (this.address.length < 34) {
      return false
    }

    for (let i in this.errors) {
      if (this.errors[i] === true) {
        return false
      }
    }

    return true
  }

  /**
   * Flip error status.
   * @function setError
   * @param {string} error - Error key to flip.
   */
  @action setError(error = '') {
    this.errors[error] = !this.errors[error]

    /** If no error key provided, clear all. */
    if (error === '') {
      for (let i in this.errors) {
        this.errors[i] = false
      }
    }
  }

  /**
   * Set address.
   * @function setAddress
   * @param {string} address - Address.
   */
  @action setAddress(address = '') {
    this.address = address

    /** Clear previously set private key. */
    if (this.privateKey !== '') {
      this.setPrivateKey()
    }

    /** Clear previously set errors. */
    if (this.errors.unknownAddress === true || this.errors.invalidAddress === true) {
      this.setError()
    }
  }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Returned private key.
   */
  @action setPrivateKey(privateKey = '') {
    this.privateKey = privateKey
  }

  /**
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action togglePopover() {
    this.popover = !this.popover
  }
}

/** Initialize a new globally used store. */
const keyDump = new KeyDump()

/** Export both, initialized store as default export, and store class as named export. */
export default keyDump
export { KeyDump }
