import { action, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'

/** WalletDump store class. */
class WalletDump {
  /**
   * Observable properties.
   * @property {boolean} popover - Popover visibility status.
   */
  @observable popover = false

  /**
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action togglePopover() { this.popover = !this.popover }

  /**
   * Dump wallet.
   * @function dumpwallet
   */
  dumpwallet() {
    rpc.call([{ 'method': 'dumpwallet', 'params': [] }], (response) => {
      if (response !== null) {
        notification.success({
          message: 'Wallet dumped',
          description: 'Successfuly dumped wallet.csv in your Vcash data directory.',
          duration: 6
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const walletDump = new WalletDump()

/** Export both, initialized store as default export, and store class as named export. */
export default walletDump
export { WalletDump }
