import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import chainBlender from './chainBlender'
import wallet from './wallet'
import walletUnlock from './walletUnlock'

/** WalletLock store class. */
class WalletLock {
  @observable snackbar

  /**
   * Prepare observable variables.
   * @constructor
   * @property {boolean} snackbar - Snackbar open status.
   */
  constructor() {
    this.snackbar = false
  }

  /**
   * Toggle snackbar.
   * @function toggleSnackbar
   */
  @action toggleSnackbar() {
    this.snackbar = !this.snackbar
  }

  /**
   * Lock wallet.
   * @function lock
   */
  lock() {
    rpc({ method: 'walletlock', params: [] }, (response) => {
      if (response !== null) {
        this.toggleSnackbar()

        if (walletUnlock.snackbar) { walletUnlock.toggleSnackbar() }
        if (chainBlender.isActivated) { chainBlender.setIsActivated(false) }

        wallet.lockCheck()
      }
    })
  }
}

const walletLock = new WalletLock()

export default walletLock
export { WalletLock }
