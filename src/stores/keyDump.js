import { action, computed, observable, reaction } from 'mobx'

/** Required store instances. */
import rpc from './rpc'

class KeyDump {
  /**
   * Observable properties.
   * @property {string} address - Address to dump.
   * @property {string} privateKey - Dumped private key.
   * @property {boolean} popover - Popover visibility status.
   * @property {object} errors - RPC response errors.
   */
  @observable address = ''
  @observable privateKey = ''
  @observable popover = false
  @observable errors = { invalidAddress: false, unknownAddress: false }

  constructor() {
    /** Clear private key and previous RPC response errors on address change. */
    reaction(() => this.address, (address) => {
      if (this.privateKey !== '') this.setPrivateKey()
      this.toggleError()
    })

    /** Clear address and private key when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.address !== '') this.setAddress()
        if (this.privateKey !== '') this.setPrivateKey()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.address.match(/^[a-zA-Z0-9]{0,34}$/) === null) return 'invalidCharacters'
    if (this.address.length < 34) return 'incompleteAddress'
    if (this.errors.invalidAddress === true) return 'invalidAddress'
    if (this.errors.unknownAddress === true) return 'unknownAddress'
    return false
  }

  /**
   * Toggle RPC response error status.
   * @function toggleError
   * @param {string} key - Error key to toggle.
   */
  @action toggleError(key = '') {
    if (key === '') {
      /** Clear all errors if no key provided. */
      for (let i in this.errors) {
        if (this.errors[i] === true) this.errors[i] = false
      }
    } else {
      this.errors[key] = !this.errors[key]
    }
  }

  /**
   * Set address.
   * @function setAddress
   * @param {string} address - Address.
   */
  @action setAddress(address = '') {
    this.address = address
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
              return this.toggleError('unknownAddress')

            /** Invalid address: error_code_invalid_address_or_key = -5 */
            case -5:
              return this.toggleError('invalidAddress')
          }
        }

        this.setPrivateKey(response[0].result)
      }
    })
  }
}

/** Initialize a new globally used store. */
const keyDump = new KeyDump()

/** Export both, initialized store as default export, and store class as named export. */
export default keyDump
export { KeyDump }
