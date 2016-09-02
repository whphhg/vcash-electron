import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import wallet from './wallet'

/** WalletUnlock store class. */
class WalletUnlock {
  @observable passphrase
  @observable button
  @observable dialog
  @observable snackbar
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} passphrase - Entered passphrase.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} dialog - Dialog open status.
   * @property {boolean} snackbar - Snackbar open status.
   * @property {object} errors - Error status.
   * @property {boolean} errors.incorrect - Incorrect passphrase error.
   * @property {boolean} errors.missing - Missing passphrase error.
   */
  constructor() {
    this.passphrase = ''
    this.button = false
    this.dialog = false
    this.snackbar = false
    this.errors = {
      incorrect: false,
      missing: false
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
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Entered passphrase.
   */
  @action setPassphrase(passphrase) {
    this.passphrase = passphrase

    if (passphrase.length === 0) {
      if (this.errors.missing === false) {
        this.setError('missing')
      }
    } else {
      if (this.errors.missing || this.errors.incorrect) {
        this.setError('')
      }
    }
  }

  /**
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    /** Reset passphrase on opening. */
    if (this.dialog) {
      this.setPassphrase('')
    }
  }

  /**
   * Toggle snackbar.
   * @function toggleSnackbar
   */
  @action toggleSnackbar() {
    this.snackbar = !this.snackbar
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
          this.toggleDialog()
          this.toggleSnackbar()
          wallet.lockCheck()
        }
      }
    })
  }
}

const walletUnlock = new WalletUnlock()

export default walletUnlock
export { WalletUnlock }
