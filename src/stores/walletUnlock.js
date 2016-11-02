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
   * @property {object} errors - Form input errors.
   */
  constructor() {
    this.passphrase = ''
    this.modal = false
    this.errors = {
      incorrectPass: false
    }

    /** Auto clear entered passphrase on modal closure. */
    autorun(() => {
      if (this.modal === false) {
        this.setPassphrase()
      }
    })
  }

  /**
   * Unlock the wallet.
   * @function walletpassphrase
   */
  walletpassphrase() {
    rpc.call([{ method: 'walletpassphrase', params: [this.passphrase] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Incorrect passphrase: error_code_wallet_passphrase_incorrect = -14 */
            case -14:
              return this.setError('incorrectPass')
          }
        } else {
          wallet.lockCheck()
          this.toggleModal()
          notification.success({
            message: 'Unlocked',
            description: 'The wallet has been unlocked.',
            duration: 5
          })
        }
      }
    })
  }

  /**
   * Get form submit button status.
   * @function button
   * @return {boolean} Button status.
   */
  @computed get button() {
    if (this.passphrase.length < 1) {
      return false
    }

    if (this.errors.incorrectPass === true) {
      return false
    }

    return true
  }

  /**
   * Flip error status.
   * @function setError
   * @param {string} error - Error key to flip.
   */
  @action setError(error) {
    this.errors[error] = !this.errors[error]
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Passphrase.
   */
  @action setPassphrase(passphrase = '') {
    this.passphrase = passphrase

    /** Clear previously incorrect passphrase error. */
    if (this.errors.incorrectPass === true) {
      this.setError('incorrectPass')
    }
  }

  /**
   * Toggle modal visibility.
   * @function toggleModal
   */
  @action toggleModal() {
    this.modal = !this.modal
  }
}

/** Initialize a new globally used store. */
const walletUnlock = new WalletUnlock()

/** Export both, initialized store as default export, and store class as named export. */
export default walletUnlock
export { WalletUnlock }
