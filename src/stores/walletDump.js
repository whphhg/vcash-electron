import { action, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'

/** WalletDump store class. */
class WalletDump {
  @observable popover

  /**
   * @constructor
   * @property {boolean} popover - Popover visibility status.
   */
  constructor() {
    this.popover = false
  }

  /**
   * Dump wallet.
   * @function dumpwallet
   */
  dumpwallet() {
    rpc.call([{ 'method': 'dumpwallet', 'params': [] }], (response) => {
      if (response !== null) {
        this.togglePopover()
        notification.success({
          message: 'Wallet dumped',
          description: 'Successfuly dumped wallet.csv in your Vcash data directory.',
          duration: 5
        })
      }
    })
  }

  /**
   * Toggle popover.
   * @function togglePopover
   */
  @action togglePopover() {
    this.popover = !this.popover
  }
}

/** Initialize a new globally used store. */
const walletDump = new WalletDump()

/** Export both, initialized store as default export, and store class as named export. */
export default walletDump
export { WalletDump }
