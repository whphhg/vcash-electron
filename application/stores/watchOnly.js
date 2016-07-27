import { action, computed, observable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'
import { getAddress } from '../utilities/explorer'

/** WatchOnly store class. */
class WatchOnly {
  @observable addresses
  @observable viewingAddress
  @observable viewingDialog

  /**
   * Prepare observable variables and initiate the balance updating loop.
   * @constructor
   * @property {object} addresses - Addresses as keys and values as their data.
   * @property {string} viewingAddress - Address being viewed.
   * @property {string} viewingDialog - Viewing dialog status.
   * @property {number} timer - Update timer id.
   */
  constructor() {
    this.addresses = getItem('watchOnly') || {}
    this.viewingAddress = ''
    this.viewingDialog = false
    this.timer = 0

    this.update()
  }

  /**
   * Add new address.
   * @function setAddress
   * @param {string} address - Provided address.
   * @param {string} note - Provided note or empty.
   */
  @action addAddress(address, note = '') {
    this.addresses = {
      ...this.addresses,
      [address]: {
        address,
        note,
        balance: 0,
        lastUpdate: 0
      }
    }

    this.update()
  }

  /**
   * Edit address.
   * @function editAddress
   * @param {string} address - Address to edit.
   * @param {string} note - New note.
   */
  @action editAddress(note) {
    if (note.match(/^[a-zA-Z0-9,.:!?()-+ ]{0,100}$/)) {
      this.addresses[this.viewingAddress].note = note
      this.save()
    }
  }

  /**
   * Remove viewing address.
   * @function removeAddress
   * @param {string} address - Address to remove.
   */
  @action removeAddress() {
    this.addresses = this.addressList.reduce((addresses, address) => {
      if (address !== this.viewingAddress) {
        addresses[address] = this.addresses[address]
      }

      return addresses
    }, {})

    this.save()
  }

  /**
   * Update balances.
   * @function updateBalances
   * @param {object} updated - Object with addresses as keys and data as values.
   * @param {number} timer - Update timer id.
   */
  @action updateBalances(updated, timer) {
    this.timer = timer

    Object.keys(updated).map((address) => {
      if (this.addresses[address].balance !== updated[address].balance) {
        this.addresses[address] = {
          ...this.addresses[address],
          balance: updated[address].balance
        }
      }

      this.addresses[address].lastUpdate = Date.now()
    })

    this.save()
  }

  /**
   * Set viewing address.
   * @function setViewingAddress
   * @param {string} address - Address to view.
   */
  @action setViewingAddress(address) {
    this.viewingAddress = address
  }

  /**
   * Toggle viewing dialog.
   * @function toggleViewingDialog
   */
  @action toggleViewingDialog() {
    this.viewingDialog = !this.viewingDialog
  }

  /**
   * Get all watchOnly addresses in an array.
   * @function addressList
   * @return {array} Array of all watchOnly addresses.
   */
  @computed get addressList() {
    let addressList = []

    for (let i in this.addresses) {
      addressList.push(i)
    }

    return addressList
  }

  /**
   * Get address objects in an array.
   * @function toArray
   * @return {array} Contains address objects.
   */
  @computed get toArray() {
    return this.addressList.reduce((toArray, key) => {
      toArray.push(this.addresses[key])
      return toArray
    }, [])
  }

  /**
   * Get viewing address data.
   * @function viewingAddressData
   * @return {object} Currently viewing address data.
   */
  @computed get viewingAddressData() {
    if (this.viewingAddress in this.addresses) {
      return this.addresses[this.viewingAddress]
    } else {
      return {
        balance: 0,
        note: '',
        lastUpdate: 0
      }
    }
  }

  /**
   * Save addresses to local storage.
   * @function save
   */
  save() {
    setItem('watchOnly', this.addresses)
  }

  /**
   * Update addresses balances.
   * @function update
   */
  update() {
    clearTimeout(this.timer)

    let addresses = this.addressList
    let promises = []

    /** Filter addresses that haven't been updated yet (newly added). */
    const neverUpdated = addresses.filter((address) => {
      return this.addresses[address].lastUpdate === 0
    })

    /** If there are any newly added addresses, update only those. */
    if (neverUpdated.length > 0) {
      addresses = neverUpdated
    }

    if (addresses.length > 0) {
      addresses.map((address, i) => {
        promises.push(new Promise((resolve, reject) => {
          setTimeout(() => {
            getAddress(address, (response) => {
              if (response !== null) {
                process.env.NODE_ENV === 'dev' && console.info('HTTPS: Explorer lookup ' + address + ' (' + i + ').')
                resolve(response)
              } else {
                reject('')
              }
            })
          }, i * 400)
        }))
      })

      Promise.all(promises)
        .then((responses) => {
          const updated = responses.reduce((updated, response) => {
            updated[response.address] = {
              balance: parseFloat(response.balance).toFixed(6)
            }

            return updated
          }, {})

          const timer = setTimeout(() => { this.update() }, 600 * 1000)
          this.updateBalances(updated, timer)
        },
        (error) => {
          process.env.NODE_ENV === 'dev' && console.error('There was an error when updating watchOnly addresses.', error)
          setTimeout(() => { this.update() }, 300 * 1000)
        }
      )
    }
  }
}

const watchOnly = new WatchOnly()

export default watchOnly
export { WatchOnly }
