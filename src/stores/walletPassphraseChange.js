import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

class WalletPassphraseChange {
  /**
   * Observable properties.
   * @property {string} oldPassphrase - Current passphrase.
   * @property {string} newPassphrase - New passphrase.
   * @property {string} repeat - New passphrase repeated.
   * @property {object} errors - RPC response errors.
   */
  @observable oldPassphrase = ''
  @observable newPassphrase = ''
  @observable repeat = ''
  @observable errors = { incorrectPassphrase: false }

  constructor() {
    /** Clear previous RPC errors on oldPassphrase change. */
    reaction(() => this.oldPassphrase, (oldPassphrase) => {
      if (this.errors.incorrectPassphrase === true) this.toggleError()
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.oldPassphrase.length < 1 || this.newPassphrase < 1 || this.repeat.length < 1) return 'emptyFields'
    if (this.newPassphrase === this.oldPassphrase) return 'sameAsBefore'
    if (this.newPassphrase.length !== this.repeat.length) return 'differentLengths'
    if (this.newPassphrase !== this.repeat) return 'notMatching'
    if (this.errors.incorrectPassphrase === true) return 'incorrectPassphrase'
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
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Passphrase.
   * @param {string} key - Set provided passphrase to this key.
   */
  @action setPassphrase(passphrase = '', key) {
    this[key] = passphrase
  }

  /**
   * Change wallet passphrase.
   * @function walletpassphrasechange
   */
  walletpassphrasechange() {
    rpc.call([{ method: 'walletpassphrasechange', params: [this.oldPassphrase, this.newPassphrase] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Incorrect passphrase: error_code_wallet_passphrase_incorrect = -14 */
            case -14:
              wallet.lockCheck()
              return this.toggleError('incorrectPassphrase')
          }
        }

        notification.success({
          message: 'Passphrase changed',
          description: 'Wallet passphrase was changed successfuly.',
          duration: 6
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletPassphraseChange = new WalletPassphraseChange()

/** Export both, initialized store as default export, and store class as named export. */
export default walletPassphraseChange
export { WalletPassphraseChange }
