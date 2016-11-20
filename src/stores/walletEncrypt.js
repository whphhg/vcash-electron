import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

/** WalletEncrypt store class. */
class WalletEncrypt {
  /**
   * Observable properties.
   * @property {string} passphrase - Form element input value.
   * @property {string} repeat - Form element input value.
   * @property {boolean} modal - Modal visibility status.
   */
  @observable passphrase = ''
  @observable repeat = ''
  @observable modal = false

  constructor() {
    /** Clear passphrase fields when modal closes. */
    reaction(() => this.modal, (modal) => {
      if (modal === false) {
        if (this.passphrase !== '') this.setPassphrase()
        if (this.repeat !== '') this.setRepeat()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.passphrase.length < 1 || this.repeat.length < 1) return 'emptyFields'
    if (this.passphrase.length !== this.repeat.length) return 'differentLengths'
    if (this.passphrase !== this.repeat) return 'notMatching'
    return false
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Passphrase.
   */
  @action setPassphrase(passphrase = '') { this.passphrase = passphrase }

  /**
   * Set repeat.
   * @function setRepeat
   * @param {string} repeat - Repeated passphrase.
   */
  @action setRepeat(repeat = '') { this.repeat = repeat }

  /**
   * Toggle modal visibility.
   * @function toggleModal
   */
  @action toggleModal() { this.modal = !this.modal }

  /**
   * Encrypt wallet.
   * @function encryptwallet
   */
  encryptwallet() {
    rpc.call([{ method: 'encryptwallet', params: [this.passphrase] }], (response) => {
      if (response !== null) {
        wallet.lockCheck()
        notification.success({
          message: 'Wallet encrypted',
          description: 'Please re-start the daemon.',
          duration: 0
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletEncrypt = new WalletEncrypt()

/** Export both, initialized store as default export, and store class as named export. */
export default walletEncrypt
export { WalletEncrypt }
