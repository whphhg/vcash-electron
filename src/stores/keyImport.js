import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import addresses from './addresses'

/** KeyImport store class. */
class KeyImport {
  /**
   * Observable properties.
   * @property {string} privateKey - Form element input value.
   * @property {string} account - Form element input value.
   * @property {boolean} loading - Button loading status.
   * @property {boolean} popover - Popover visibility status.
   * @property {object} errors - RPC response errors.
   */
  @observable privateKey = ''
  @observable account = ''
  @observable loading = false
  @observable popover = false
  @observable errors = { invalidKey: false, isMine: false }

  constructor() {
    /** Clear previous RPC response errors on private key change. */
    reaction(() => this.privateKey, (privateKey) => { if (privateKey !== '') this.toggleError() })

    /** Clear private key when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
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
        if (this.errors[i] === true) this.errors[i] = false
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
   * Toggle button loading animation.
   * @function toggleLoading
   */
  @action toggleLoading() { this.loading = !this.loading }

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
    /** Disable button and toggle on loading indicator. */
    this.toggleLoading()

    rpc.call([{ method: 'importprivkey', params: [this.privateKey, this.account] }], (response) => {
      if (response !== null) {
        /** Re-enable button and toggle off loading indicator. */
        this.toggleLoading()

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
          duration: 6
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
