import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

/** Required store instances. */
import rpc from './rpc'
import rates from './rates'

class Addresses {
  /**
   * Observable properties.
   * @property {array} receivedByAddress - listreceivedbyaddress RPC response.
   */
  @observable receivedByAddress = []

  constructor () {
    /** When RPC status changes. */
    reaction(() => rpc.status, (status) => {
      /** Run when RPC becomes available. */
      if (status === true) this.listreceivedbyaddress()
    })
  }

  /**
   * Get a list of account names in alphabetical order.
   * @function accounts
   * @return {array} Account list.
   */
  @computed get accounts () {
    /** Reduce the array and add account names to the Set. */
    let accounts = this.receivedByAddress.reduce((accounts, obj) => {
      if (obj.account !== '') accounts.add(obj.account)
      return accounts
    }, new Set())

    /** Convert Set to Array. */
    accounts = [...accounts]

    return accounts.sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return -1
      if (a.toLowerCase() > b.toLowerCase()) return 1
      return 0
    })
  }

  /**
   * Get a list of addresses.
   * @function list
   * @return {array} Address list.
   */
  @computed get list () {
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
  @computed get all () {
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
  @action setResponse (response) {
    this.receivedByAddress = response
  }

  /**
   * Get all addresses, including unused.
   * @function listreceivedbyaddress
   */
  listreceivedbyaddress () {
    rpc.call([
      {
        method: 'listreceivedbyaddress',
        params: [0, true]
      }
    ], (response) => {
      if (response !== null) {
        /** Set the response. */
        this.setResponse(response[0].result)
      }
    })
  }

  /**
   * Get new address.
   * @function getNew
   * @param {string} account - Assign the address to this account.
   * @param {function} callback - Return result & error to this function.
   */
  getNew (account, callback) {
    rpc.call([
      {
        method: 'getnewaddress',
        params: [account]
      }
    ], (response) => {
      if (response !== null) {
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** - 12 = error_code_wallet_keypool_ran_out */
              case -12:
                return 'keypoolRanOut'
            }
          }

          return false
        }

        if (response[0].hasOwnProperty('result') === true) {
          this.listreceivedbyaddress()

          /** Display notification. */
          notification.success({
            message: i18next.t('wallet:addressGenerated'),
            description: response[0].result,
            duration: 10
          })
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Dump the private key of provided address.
   * @function dumpKey
   * @param {string} address - Address to dump the key of.
   * @param {function} callback - Return result & error to this function.
   */
  dumpKey (address, callback) {
    rpc.call([
      {
        method: 'dumpprivkey',
        params: [address]
      }
    ], (response) => {
      if (response !== null) {
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -4 = error_code_wallet_error */
              case -4:
                return 'unknownAddress'

              /** -5 = error_code_invalid_address_or_key */
              case -5:
                return 'invalidAddress'
            }
          }

          return false
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Import the private key and assign it to the provided account.
   * @function importKey
   * @param {string} privateKey - Private key to import.
   * @param {string} account - Account to assign the key to.
   * @param {function} callback - Return result & error to this function.
   */
  importKey (privateKey, account, callback) {
    rpc.call([
      {
        method: 'importprivkey',
        params: [privateKey, account]
      }
    ], (response) => {
      if (response !== null) {
        this.listreceivedbyaddress()

        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -4 = error_code_wallet_error */
              case -4:
                return 'isMine'

              /** -5 = error_code_invalid_address_or_key */
              case -5:
                return 'invalidKey'
            }
          }

          return false
        }

        if (response[0].hasOwnProperty('result') === true) {
          /** Display notification. */
          notification.success({
            message: i18next.t('wallet:privateKeyImported'),
            description: i18next.t('wallet:privateKeyImportedLong'),
            duration: 6
          })
        }

        return callback(response[0].result, error())
      }
    })
  }
}

/** Initialize a new globally used store. */
const addresses = new Addresses()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default addresses
export { Addresses }
