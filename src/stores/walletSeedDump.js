import { action, computed, observable } from 'mobx'

/** Required store instances. */
import rpc from './rpc'

class WalletSeedDump {
  /**
   * Observable properties.
   * @property {string} seed - Dumped seed.
   * @property {object} errors - RPC response errors.
   */
  @observable seed = ''
  @observable errors = { notDeterministic: false }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.errors.notDeterministic === true) return 'notDeterministic'
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
  @action setSeed(seed = '') {
    this.seed = seed
  }

  /**
   * Dump wallet seed.
   * @function dumpwalletseed
   */
  dumpwalletseed() {
    rpc.call([{ 'method': 'dumpwalletseed', 'params': [] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Not deterministic: error_code_wallet_error = -4 */
            case -4:
              return this.toggleError('notDeterministic')
          }
        }

        this.setSeed(response[0].result)
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletSeedDump = new WalletSeedDump()

/** Export both, initialized store as default export, and store class as named export. */
export default walletSeedDump
export { WalletSeedDump }
