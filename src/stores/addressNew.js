import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import addresses from './addresses'

/** AddressNew store class. */
class AddressNew {
  /**
   * Observable properties.
   * @property {string} account - Form element input value.
   * @property {string} address - Generated address.
   * @property {boolean} popover - Popover visibility status.
   * @property {object} errors - RPC response errors.
   */
  @observable account = ''
  @observable address = ''
  @observable popover = false
  @observable errors = { keypoolRanOut: false }

  constructor() {
    /** Clear address when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.address !== '') this.setAddress()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|boolean} Current error or false if none.
   */
  @computed get errorStatus() {
    if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) return 'invalidCharacters'
    if (this.errors.keypoolRanOut === true) return 'keypoolRanOut'
    return false
  }

  /**
   * Toggle RPC response error status.
   * @function toggleError
   * @param {string} key - Error key to toggle.
   */
  @action toggleError(key) { this.errors[key] = !this.errors[key] }

  /**
   * Set account name.
   * @function setAccount
   * @param {string} account - Account name.
   */
  @action setAccount(account) { this.account = account }

  /**
   * Set address.
   * @function setAddress
   * @param {string} address - Generated address.
   */
  @action setAddress(address = '') { this.address = address }

  /**
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action togglePopover() { this.popover = !this.popover }

  /**
   * Get new address.
   * @function getnewaddress
   */
  getnewaddress() {
    rpc.call([{ method: 'getnewaddress', params: [this.account] }], (response) => {
      if (response !== null) {
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** Keypool ran out: error_code_wallet_keypool_ran_out = -12 */
            case -12:
              return this.toggleError('keypoolRanOut')
          }
        }

        this.setAddress(response[0].result)
        addresses.listreceivedbyaddress()
        notification.success({
          message: 'New address generated',
          description: response[0].result,
          duration: 10
        })
      }
    })
  }
}

/** Initialize a new globally used store. */
const addressNew = new AddressNew()

/** Export both, initialized store as default export, and store class as named export. */
export default addressNew
export { AddressNew }
