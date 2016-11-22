import { action, computed, observable } from 'mobx'
import { notification } from 'antd'
import { remote } from 'electron'
import { sep } from 'path'
import { dataPath } from '../utilities/common'

/** Required store instances. */
import rpc from './rpc'

class WalletBackup {
  /**
   * Observable properties.
   * @property {string} path - Dumping location.
   * @property {object} errors - RPC response errors.
   */
  @observable path = dataPath()
  @observable errors = { backupFailed: false }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.errors.backupFailed === true) return 'backupFailed'
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
   * Set path.
   * @function setPath
   */
  @action setPath(path) {
    this.path = path
  }

  /**
   * Open electron dialog and set selected path.
   * @function getPath
   */
  getPath() {
    const path = remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (typeof path !== 'undefined') this.setPath(path[0] + sep)
  }

  /**
   * Backup wallet.
   * @function backupwallet
   */
  backupwallet() {
    rpc.call([{ 'method': 'backupwallet', 'params': [this.path] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Backup failed: error_code_wallet_error = -4 */
            case -4:
              return this.toggleError('backupFailed')
          }
        }

        notification.success({
          message: 'Backup successful',
          description: 'Saved into ' + this.path,
          duration: 6
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletBackup = new WalletBackup()

/** Export both, initialized store as default export, and store class as named export. */
export default walletBackup
export { WalletBackup }
