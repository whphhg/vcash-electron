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
   * @property {object} errors - Form input errors.
   */
  constructor() {
    this.privateKey = ''
    this.account = ''
    this.popover = false
    this.errors = {
      invalidCharacters: false,
      invalidKey: false,
      isMine: false
    }

    /** Auto validate account name on every change. */
    autorun(() => {
      if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) {
        if (this.errors.invalidCharacters === false) {
          this.setError('invalidCharacters')
        }
      } else {
        if (this.errors.invalidCharacters === true) {
          this.setError('invalidCharacters')
        }
      }
    })

    /** Auto clear entered private key when popover closes. */
    autorun(() => {
      if (this.popover === false) {
        this.setPrivateKey()
      }
    })
  }

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
              return this.setError('isMine')

            /** Invalid key: error_code_invalid_address_or_key = -5 */
            case -5:
              return this.setError('invalidKey')
          }
        }

        if (this.popover === true) {
          this.togglePopover()
        }

        addresses.listreceivedbyaddress()
        notification.success({
          message: 'Imported',
          description: 'Private key succcessfuly imported.',
          duration: 5
        })
      }
    })
  }

  /**
   * Get form submit button status.
   * @function button
   * @return {boolean} Button status.
   */
  @computed get button() {
    /** Do not allow submitting less than full-length private keys. */
    if (this.privateKey.length < 51) {
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
   * Set account name.
   * @function setAccount
   * @param {string} account - Account name.
   */
  @action setAccount(account) {
    this.account = account
  }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Private key to import.
   */
  @action setPrivateKey(privateKey = '') {
    if (privateKey.match(/^[a-zA-Z0-9]{0,52}$/)) {
      this.privateKey = privateKey

      /** Clear previously set errors. */
      if (this.errors.invalidKey === true || this.errors.isMine === true) {
        this.setError()
      }
    }
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
const keyImport = new KeyImport()

/** Export both, initialized store as default export, and store class as named export. */
export default keyImport
export { KeyImport }
