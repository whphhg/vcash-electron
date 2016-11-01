import { action, autorun, computed, observable } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import addresses from './addresses'

/** AddressNew store class. */
class AddressNew {
  @observable account
  @observable popover
  @observable errors

  /**
   * @constructor
   * @property {string} account - Form element input value.
   * @property {boolean} popover - Popover visibility status.
   * @property {object} errors - Form input errors.
   */
  constructor() {
    this.account = ''
    this.popover = false
    this.errors = {
      invalidCharacters: false
    }

    /** Auto validate account name on every change. */
    autorun(() => {
      if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) {
        if (this.errors.invalidCharacters === false) {
          this.setError('invalidCharacters')
        }
      } else {
        if (this.errors.invalidCharacters === true) {
          this.setError('invalidCharacters')
        }
      }
    })
  }

  /**
   * Get new address.
   * @function getnewaddress
   *
   * TODO: Handle error_code_wallet_keypool_ran_out.
   */
  getnewaddress() {
    rpc.call([{ method: 'getnewaddress', params: [this.account] }], (response) => {
      if (response !== null) {
        this.togglePopover()
        addresses.listreceivedbyaddress()
        notification.success({
          message: 'New address generated',
          description: response[0].result,
          duration: 10
        })
      }
    })
  }

  /**
   * Set account name.
   * @function setAccount
   * @param {string} account - Account name.
   */
  @action setAccount(account) {
    this.account = account
  }

  /**
   * Set error.
   * @function setError
   * @param {string} error - Error key.
   */
  @action setError(error) {
    for (let i in this.errors) {
      if (error === i) {
        this.errors[i] = !this.errors[i]
        break
      }
    }
  }

  /**
   * Get form submit button status.
   * @function button
   * @return {boolean} Button status.
   */
  @computed get button() {
    for (let i in this.errors) {
      if (this.errors[i] === true) {
        return false
      }
    }

    return true
  }

  /**
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action togglePopover() {
    this.popover = !this.popover
  }
}

/** Initialize a new globally used store. */
const addressNew = new AddressNew()

/** Export both, initialized store as default export, and store class as named export. */
export default addressNew
export { AddressNew }
