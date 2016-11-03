import { action, autorun, computed, observable } from 'mobx'

/** Required store instances. */
import rpc from './rpc'
import rates from './rates'

/** Addresses store class. */
class Addresses {
  @observable receivedByAddress

  /**
   * @constructor
   * @property {array} receivedByAddress - listreceivedbyaddress RPC response.
   */
  constructor() {
    this.receivedByAddress = []

    /** Auto start updating when RPC becomes available. */
    autorun(() => {
      if (rpc.status === true) this.listreceivedbyaddress()
    })
  }

  /**
   * Get a list of account names in alphabetical order.
   * @function accounts
   * @return {array} Account list.
   */
  @computed get accounts() {
    /** Reduce the array and add account names to the Set. */
    let accounts = this.receivedByAddress.reduce((accounts, obj) => {
      if (obj.account !== '') {
        accounts.add(obj.account)
      }

      return accounts
    }, new Set())

    /** Convert Set to Array. */
    accounts = [...accounts]

    /** Sort accounts by name. */
    accounts.sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return -1
      if (a.toLowerCase() > b.toLowerCase()) return 1
      return 0
    })

    return accounts
  }

  /**
   * Get a list of addresses.
   * @function list
   * @return {array} Address list.
   */
  @computed get list() {
    /** Reduce the array and add addresses to the Set. */
    const addresses = this.receivedByAddress.reduce((addresses, obj) => {
      addresses.add(obj.address)
      return addresses
    }, new Set())

    return [...addresses]
  }

  /**
   * Get addresses data with local amounts.
   * @function all
   * @return {array} Addresses data with local amounts.
   */
  @computed get all() {
    return this.receivedByAddress.reduce((addresses, obj) => {
      addresses.push({
        ...obj,
        localAmount: obj.amount * rates.local * rates.average
      })

      return addresses
    }, [])
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {array} response - RPC response array.
   */
  @action setResponse(response) {
    this.receivedByAddress = response
  }

  /**
   * Get all addresses, including unused.
   * @function listreceivedbyaddress
   */
  listreceivedbyaddress() {
    rpc.call([{ method: 'listreceivedbyaddress', params: [0, true] }], (response) => {
      if (response !== null) {
        this.setResponse(response[0].result)
      }
    })
  }
}

/** Initialize a new globally used store. */
const addresses = new Addresses()

/** Export both, initialized store as default export, and store class as named export. */
export default addresses
export { Addresses }
