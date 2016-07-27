import { action, computed, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Required store instances. */
import watchOnly from './watchOnly'

/** WatchOnlyAdd store class. */
class WatchOnlyAdd {
  @observable address
  @observable note
  @observable button
  @observable dialog
  @observable snackbar
  @observable errors

  /**
   * Prepare observable variables.
   * @constructor
   * @property {string} address - New address to add.
   * @property {string} note - Note for this address.
   * @property {boolean} button - Button enabled status.
   * @property {boolean} dialog - Dialog open status.
   * @property {boolean} snackbar - Snackbar open status.
   * @property {object} errors - Error status.
   * @property {boolean} errors.alreadyAdded - Already added address error.
   * @property {boolean} errors.missing - Address not entered.
   * @property {boolean} errors.invalid - Invalid address entered.
   * @property {boolean} errors.isMine - Address belongs to this wallet.
   */
  constructor() {
    this.address = ''
    this.note = ''
    this.button = false
    this.dialog = false
    this.snackbar = false
    this.errors = {
      alreadyAdded: false,
      missing: true,
      invalid: false,
      isMine: false
    }
  }

  /**
   * Set address.
   * @function setAddress
   * @param {string} address - Provided address.
   */
  @action setAddress(address) {
    if (address.match(/^[a-zA-Z0-9]{0,34}$/)) {
      this.address = address

      if (address.length === 0) {
        if (this.errors.missing === false) {
          this.setError('missing')
        }
      } else {
        if (address.length === 34) {
          rpc({ method: 'validateaddress', params: [address] }, (response) => {
            if (response !== null) {
              if (response.result.isvalid === false) {
                return this.setError('invalid')
              }

              if (response.result.ismine) {
                return this.setError('isMine')
              }

              if (response.result.isvalid) {
                if (watchOnly.addresses[address]) {
                  this.setError('alreadyAdded')
                } else {
                  return this.setError('')
                }
              }
            }
          })
        } else {
          if (this.errors.missing === false) {
            this.setError('missing')
          }
        }
      }
    }
  }

  /**
   * Set note.
   * @function setNote
   * @param {string} note - Provided note.
   */
  @action setNote(note) {
    if (note.match(/^[a-zA-Z0-9,.:!? ]{0,100}$/)) {
      this.note = note
    }
  }

  /**
   * Set error and button.
   * @function setError
   * @param {string} error - Error key.
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
   * Toggle dialog.
   * @function toggleDialog
   */
  @action toggleDialog() {
    this.dialog = !this.dialog

    /** Reset address and note on opening. */
    if (this.dialog) {
      this.setAddress('')
      this.setNote('')

      if (this.snackbar) {
        this.toggleSnackbar()
      }
    }
  }

  /**
   * Toggle snackbar.
   * @function toggleSnackbar
   */
  @action toggleSnackbar() {
    this.snackbar = !this.snackbar
  }
}

const watchOnlyAdd = new WatchOnlyAdd()

export default watchOnlyAdd
export { WatchOnlyAdd }
