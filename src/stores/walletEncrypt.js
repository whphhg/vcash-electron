import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import wallet from './wallet'

/** WalletEncrypt store class. */
class WalletEncrypt {
  @observable modalOpen
  @observable passphrase
  @observable repeat
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {boolean} modalOpen - Modal status.
   * @property {string} passphrase - Entered passphrase.
   * @property {string} repeat - Passphrase repeat.
   * @property {object} errors - Error status.
   * @property {boolean} errors.different - Passphrases do not match.
   * @property {boolean} errors.missing - Missing passphrase.
   */
  constructor() {
    this.modalOpen = false
    this.passphrase = ''
    this.repeat = ''
    this.errors = {
      different: false,
      missing: false
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
  }

  /**
   * Set repeat.
   * @function setRepeat
   * @param {string} repeat - Passphrase repeat.
   */
  @action setRepeat(repeat = '') {
    this.repeat = repeat
  }

  /**
   * Toggle modal.
   * @function toggleModal
   */
  @action toggleModal() {
    this.modalOpen = !this.modalOpen

    /** Reset passphrase fields on opening. */
    if (this.modalOpen) {
      this.setPassphrase()
      this.setRepeat()
      this.setError()
    }
  }

  /**
   * Encrypt wallet.
   * @function encryptwallet
   */
  encrypt() {
    if (this.passphrase.length === 0 || this.repeat.length === 0) {
      return this.setError('missing')
    } else {
      if (this.passphrase !== this.repeat) {
        return this.setError('different')
      } else {
        rpc({ method: 'encryptwallet', params: [this.passphrase] }, (response) => {
          if (response !== null) {
            this.toggleModal()
            wallet.lockCheck()
          }
        })
      }
    }
  }
}

const walletEncrypt = new WalletEncrypt()

export default walletEncrypt
export { WalletEncrypt }
