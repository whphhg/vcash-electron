import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import wallet from './wallet'

/** WalletUnlock store class. */
class WalletUnlock {
  @observable modalOpen
  @observable passphrase
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {boolean} modalOpen - Modal status.
   * @property {string} passphrase - Entered passphrase.
   * @property {object} errors - Error status.
   * @property {boolean} errors.incorrect - Incorrect passphrase.
   */
  constructor() {
    this.modalOpen = false
    this.passphrase = ''
    this.errors = {
      incorrect: false
    }
  }

  /**
   * Set error.
   * @function setError
   * @param {string} error - Error key.
   */
  @action setError(error = '') {
    for (let i in this.errors) {
      if (error === i) {
        this.errors[i] = true
      } else {
        this.errors[i] = false
      }
    }
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Entered passphrase.
   */
  @action setPassphrase(passphrase = '') {
    this.passphrase = passphrase

    /** Clear previous error. */
    if (this.errors.incorrect) {
      this.setError()
    }
  }

  /**
   * Toggle modal.
   * @function toggleModal
   */
  @action toggleModal() {
    this.modalOpen = !this.modalOpen

    /** Reset passphrase on opening. */
    if (this.modalOpen) {
      this.setPassphrase()
    }
  }

  /**
   * Unlock wallet.
   * @function unlock
   */
  unlock() {
    rpc({ method: 'walletpassphrase', params: [this.passphrase] }, (response) => {
      if (response !== null) {
        if (response.hasOwnProperty('error')) {
          /** error_code_wallet_passphrase_incorrect = -14 (passphrase incorrect). */
          switch (response.error.code) {
            case -14:
              return this.setError('incorrect')
          }
        } else {
          this.toggleModal()
          wallet.lockCheck()
        }
      }
    })
  }
}

const walletUnlock = new WalletUnlock()

export default walletUnlock
export { WalletUnlock }
