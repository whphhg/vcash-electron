import { action, computed, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import wallet from './wallet'

class WalletEncrypt {
  /**
   * Observable properties.
   * @property {string} passphrase - Passphrase to encrypt with.
   * @property {string} repeat - Passphrase repeated.
   */
  @observable passphrase = ''
  @observable repeat = ''

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
   * @param {string} key - Set provided passphrase to this key.
   */
  @action setPassphrase(passphrase = '', key) {
    this[key] = passphrase
  }

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
