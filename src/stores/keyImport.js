import { action, autorun, computed, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import addresses from './addresses'

/** KeyImport store class. */
class KeyImport {
  @observable privateKey
  @observable account
  @observable popover
  @observable errors

  /**
   * @constructor
   * @property {string} privateKey - Form element input value.
   * @property {string} account - Form element input value.
   * @property {boolean} popover - Popover visibility status.
   * @property {object} errors - RPC response errors.
   */
  constructor() {
    this.privateKey = ''
    this.account = ''
    this.popover = false
    this.errors = {
      invalidKey: false,
      isMine: false
    }

    /** Auto clear previous RPC response errors on private key change. */
    autorun(() => {
      const trackPrivateKey = this.privateKey
      this.toggleError()
    })

    /** Auto clear private key when popover closes. */
    autorun(() => {
      if (this.popover === false) {
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
    if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) return 'invalidCharacters'
    if (this.privateKey.length < 51) return 'incompleteKey'
    if (this.errors.invalidKey === true) return 'invalidKey'
    if (this.errors.isMine === true) return 'isMine'

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
        if (this.errors[i] === true) {
          this.errors[i] = false
        }
      }
    } else {
      this.errors[key] = !this.errors[key]
    }
  }

  /**
   * Set account name.
   * @function setAccount
   * @param {string} account - Account name.
   */
  @action setAccount(account) { this.account = account }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Private key.
   */
  @action setPrivateKey(privateKey = '') { if (privateKey.match(/^[a-zA-Z0-9]{0,52}$/) !== null) this.privateKey = privateKey }

  /**
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action togglePopover() { this.popover = !this.popover }

  /**
   * Import private key.
   * @function importprivkey
   */
  importprivkey() {
    rpc.call([{ method: 'importprivkey', params: [this.privateKey, this.account] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Is mine: error_code_wallet_error = -4 */
            case -4:
              return this.toggleError('isMine')

            /** Invalid key: error_code_invalid_address_or_key = -5 */
            case -5:
              return this.toggleError('invalidKey')
          }
        }

        addresses.listreceivedbyaddress()
        notification.success({
          message: 'Imported',
          description: 'Private key succcessfuly imported.',
          duration: 5
        })

        if (this.popover === true) this.togglePopover()
      }
    })
  }
}

/** Initialize a new globally used store. */
const keyImport = new KeyImport()

/** Export both, initialized store as default export, and store class as named export. */
export default keyImport
export { KeyImport }
