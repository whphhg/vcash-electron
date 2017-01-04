import { action, computed, observable } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

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
  @computed get errorStatus () {
    /** Get lengths only once. */
    const len = {
      pass: this.passphrase.length,
      repeat: this.repeat.length
    }

    if (len.pass < 1 || len.repeat < 1) return 'emptyFields'
    if (len.pass !== len.repeat) return 'differentLengths'
    if (this.passphrase !== this.repeat) return 'notMatching'
    return false
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {string} passphrase - Passphrase.
   * @param {string} key - Set provided passphrase to this key.
   */
  @action setPassphrase (passphrase = '', key) {
    this[key] = passphrase
  }

  /**
   * Encrypt wallet.
   * @function encryptwallet
   */
  encryptwallet () {
    rpc.call([
      {
        method: 'encryptwallet',
        params: [this.passphrase]
      }
    ], (response) => {
      if (response !== null) {
        /** Update wallet status. */
        wallet.lockCheck()

        /** Display notification. */
        notification.success({
          message: i18next.t('wallet:encrypted'),
          description: i18next.t('wallet:encryptedLong'),
          duration: 0
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletEncrypt = new WalletEncrypt()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default walletEncrypt
export { WalletEncrypt }
