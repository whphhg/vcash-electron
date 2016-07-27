import { action, computed, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import addressBook from './addressBook'

/** WalletUnlock store class. */
class AddressNew {
  @observable account
  @observable button
  @observable dialog
  @observable snackbar
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} account - Account assigned to the new address.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} dialog - Dialog open status.
   * @property {boolean} snackbar - Snackbar open status.
   * @property {object} errors - Error status.
   * @property {boolean} errors.invalid - Incorrect characters entered.
   * @property {boolean} errors.missing - Missing passphrase.
   */
  constructor() {
    this.account = ''
    this.button = true
    this.dialog = false
    this.snackbar = false
    this.errors = {
      invalid: false,
      missing: false
    }
  }

  /**
   * Set error and button.
   * @function setError
   * @param {string} error - Error key to toggle on.
   */
  @action setError(error) {
    let button = true

    for (let i in this.errors) {
      if (error === i) {
        this.errors[i] = true
        button = false
      } else {
        this.errors[i] = false
      }
    }

    this.button = button
  }

  /**
   * Set account.
   * @function setAccount
   * @param {string} account - Selected/entered account.
   */
  @action setAccount(account) {
    if (account.match(/^[a-zA-Z0-9 ]{0,100}$/)) {
      if (account.length === 0) {
        if (this.errors.missing === false) {
          this.setError('missing')
        }
      } else {
        if (this.errors.missing || this.errors.invalid) {
          this.setError('')
        }
      }

      this.account = account
    } else {
      if (!this.errors.invalid) {
        this.setError('invalid')
      }
    }
  }

  /**
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    /** Set default account to the one being shown in AddressBook. */
    if (this.dialog) {
      this.setAccount(addressBook.showAccount)
    }
  }

  /**
   * Toggle snackbar.
   * @function toggleSnackbar
   */
  @action toggleSnackbar() {
    this.snackbar = !this.snackbar
  }

  /**
   * Get new address.
   * TODO: Handle error_code_wallet_keypool_ran_out.
   * @function getnewaddress
   */
  getnewaddress() {
    rpc({ method: 'getnewaddress', params: [this.account === 'Default' ? '' : this.account] }, (response) => {
      if (response !== null) {
        addressBook.list()
        this.toggleDialog()
        this.toggleSnackbar()

        if (addressBook.showAccount !== this.account) {
          addressBook.setShowAccount(this.account)
        }
      }
    })
  }
}

const addressNew = new AddressNew()

export default addressNew
export { AddressNew }
