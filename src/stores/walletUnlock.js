import { action, autorun, computed, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

/** WalletUnlock store class. */
class WalletUnlock {
  @observable passphrase
  @observable modal
  @observable errors

  /**
   * @constructor
   * @property {string} passphrase - Form element input value.
   * @property {boolean} modal - Modal visibility status.
   * @property {object} errors - RPC response errors.
   */
  constructor() {
    this.passphrase = ''
    this.modal = false
    this.errors = {
      incorrectPassphrase: false
    }

    /** Auto clear previous RPC response errors on passphrase change. */
    autorun(() => {
      const trackPassphrase = this.passphrase
      this.toggleError()
    })

    /** Auto clear passphrase field when modal closes. */
    autorun(() => {
      if (this.modal === false) {
        if (this.passphrase !== '') this.setPassphrase()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.passphrase.length < 1) return 'emptyField'
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
        if (this.errors[i] === true) {
          this.errors[i] = false
        }
      }
    } else {
      this.errors[key] = !this.errors[key]
    }
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Passphrase.
   */
  @action setPassphrase(passphrase = '') { this.passphrase = passphrase }

  /**
   * Toggle modal visibility.
   * @function toggleModal
   */
  @action toggleModal() { this.modal = !this.modal }

  /**
   * Unlock wallet.
   * @function walletpassphrase
   */
  walletpassphrase() {
    rpc.call([{ method: 'walletpassphrase', params: [this.passphrase] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Incorrect passphrase: error_code_wallet_passphrase_incorrect = -14 */
            case -14:
              return this.toggleError('incorrectPassphrase')
          }
        }

        this.toggleModal()
        wallet.lockCheck()
        notification.success({
          message: 'Unlocked',
          description: 'The wallet has been unlocked.',
          duration: 6
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletUnlock = new WalletUnlock()

/** Export both, initialized store as default export, and store class as named export. */
export default walletUnlock
export { WalletUnlock }
