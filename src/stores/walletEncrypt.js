import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import wallet from './wallet'

/** WalletEncrypt store class. */
class WalletEncrypt {
  @observable passphrase
  @observable repeat
  @observable button
  @observable dialog
  @observable snackbar
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} passphrase - Entered passphrase.
   * @property {string} repeat - Repeated passphrase.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} dialog - Dialog open status.
   * @property {boolean} snackbar - Snackbar open status.
   * @property {object} errors - Error status.
   * @property {boolean} errors.different - Passphrases don't match.
   * @property {boolean} errors.missing - Missing passphrase error.
   */
  constructor() {
    this.passphrase = ''
    this.repeat = ''
    this.button = false
    this.dialog = false
    this.snackbar = false
    this.errors = {
      different: false,
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
    this.equalCheck()
  }

  /**
   * Set repeat.
   * @function setRepeat
   * @param {string} repeat - Repeated passphrase.
   */
  @action setRepeat(repeat) {
    this.repeat = repeat
    this.equalCheck()
  }

  /**
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    /** Reset passphrase and repeated passphrase on opening. */
    if (this.dialog) {
      this.setPassphrase('')
      this.setRepeat('')
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
   * Encrypt wallet.
   * @function encryptwallet
   */
  encryptwallet() {
    rpc({ method: 'encryptwallet', params: [this.passphrase] }, (response) => {
      if (response !== null) {
        this.toggleDialog()
        this.toggleSnackbar()
        wallet.lockCheck()
      }
    })
  }

  /**
   * Passphrase and repeated passphrase equality check.
   * @function equalCheck
   */
  equalCheck() {
    const passphraseLen = this.passphrase.length
    const repeatLen = this.repeat.length

    if (passphraseLen === 0 || repeatLen === 0 || passphraseLen !== repeatLen) {
      if (this.errors.missing === false) {
        this.setError('missing')
      }

      return
    }

    if (this.passphrase === this.repeat) {
      this.setError('')
    } else {
      if (this.errors.different === false) {
        this.setError('different')
      }
    }
  }
}

const walletEncrypt = new WalletEncrypt()

export default walletEncrypt
export { WalletEncrypt }
