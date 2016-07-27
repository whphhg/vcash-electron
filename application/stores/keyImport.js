import { action, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import addressBook from './addressBook'

/** KeyImport store class. */
class KeyImport {
  @observable privateKey
  @observable account
  @observable button
  @observable dialog
  @observable snackbar
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} privateKey - Private key to import.
   * @property {string} account - Account assigned to the imported address.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} dialog - Dialog open status.
   * @property {boolean} snackbar - Snackbar open status.
   * @property {object} errors - Error statuses.
   * @property {object} errors.account - Account errors.
   * @property {boolean} errors.account.invalid - Incorrect characters entered.
   * @property {boolean} errors.account.missing - Missing passphrase.
   * @property {object} errors.privateKey - Private key errors.
   * @property {boolean} errors.privateKey.alreadyImported - Key already imported.
   * @property {boolean} errors.privateKey.incomplete - Key hasn't been entered fully yet.
   * @property {boolean} errors.privateKey.invalid - Key entered is invalid.
   */
  constructor() {
    this.privateKey = ''
    this.account = ''
    this.button = false
    this.dialog = false
    this.snackbar = false
    this.errors = {
      account: {
        invalid: false,
        missing: false
      },
      privateKey: {
        alreadyImported: false,
        incomplete: true,
        invalid: false
      }
    }
  }

  /**
   * Set error and button.
   * @function setError
   * @param {string} error - Error key.
   * @param {string} type - Error type.
   */
  @action setError(error, type) {
    /** Set provided error to true and others of it's type to false. */
    for (let i in this.errors[type]) {
      if (error === i) {
        this.errors[type][i] = true
      } else {
        this.errors[type][i] = false
      }
    }

    /** Set button to false if there are errors, otherwise true. */
    let button = true

    for (let i in this.errors) {
      for (let j in this.errors[i]) {
        if (this.errors[i][j]) {
          button = false
          break
        }
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
        if (this.errors.account.missing === false) {
          this.setError('missing', 'account')
        }
      } else {
        if (this.errors.account.missing || this.errors.account.invalid) {
          this.setError('', 'account')
        }
      }

      this.account = account
    } else {
      if (!this.errors.account.invalid) {
        this.setError('invalid', 'account')
      }
    }
  }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Private key to import.
   */
  @action setPrivateKey(privateKey) {
    if (privateKey.match(/^[a-zA-Z0-9]{0,52}$/)) {
      if (privateKey.length < 51) {
        if (this.errors.privateKey.incomplete === false) {
          this.setError('incomplete', 'privateKey')
        }
      } else {
        this.setError('', 'privateKey')
      }

      this.privateKey = privateKey
    }
  }

  /**
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    /** Reset private key and set default account to the one being shown in AddressBook. */
    if (this.dialog) {
      this.setPrivateKey('')
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
   * Import private key.
   * @function importprivkey
   */
  importprivkey() {
    rpc({ method: 'importprivkey', params: [this.privateKey, this.account === 'Default' ? '' : this.account] }, (response) => {
      if (response !== null) {
        if (response.hasOwnProperty('error')) {
          /**
           * error_code_wallet_error = -4 (already imported)
           * error_code_invalid_address_or_key = -5 (invalid key)
           */
          switch (response.error.code) {
            case -4:
              return this.setError('alreadyImported', 'privateKey')

            case -5:
              return this.setError('invalid', 'privateKey')
          }
        }

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

const keyImport = new KeyImport()

export default keyImport
export { KeyImport }
