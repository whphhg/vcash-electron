import { action, computed, observable } from 'mobx'
import rpc from '../utilities/rpc'
import moment from 'moment'

/** Required store instances. */
import wallet from './wallet'

/** AddressBook store class. */
class AddressBook {
  @observable accounts
  @observable byAccount
  @observable showAccount

  /**
   * Prepare observable variables and run list function.
   * @constructor
   * @property {array} accounts - List of account names.
   * @property {object} byAccount - Accounts as keys, containing balances and addresses.
   * @property {string} showAccount - Selected account for viewing.
   */
  constructor() {
    this.accounts = []
    this.byAccount = {
      '#All': {
        balance: 0
      },
      Default: {
        balance: 0,
        addresses: []
      }
    }
    this.showAccount = 'Default'

    this.list()
  }

  /**
   * Set wallet accounts.
   * @function setAccounts
   * @param {array} accounts - List of account names.
   * @param {object} byAccount - Accounts as keys, containing balances and addresses.
   */
  @action setAccounts(accounts, byAccount) {
    this.accounts = accounts
    this.byAccount = byAccount
  }

  /**
   * Set show account.
   * @function setShowAccount
   * @param {string} showAccount - Account to show.
   */
  @action setShowAccount(showAccount) {
    this.showAccount = showAccount
  }

  /**
   * Get account list.
   * @function accountList
   * @return {array} Account names.
   */
  @computed get accountList() {
    return this.accounts.filter((account) => {
      return account !== 'Default'
    })
  }

  /**
   * Get show account addresses.
   * @function showAccountAddresses
   * @return {array} Show account addresses.
   */
  @computed get showAccountAddresses() {
    if (this.showAccount in this.byAccount) {
      return this.byAccount[this.showAccount].addresses.sort((a, b) => {
        return parseInt(b.received) - parseInt(a.received)
      })
    } else {
      return []
    }
  }

  /**
   * Get show account balance.
   * @function showAccountBalance
   * @return {number} Show account balance.
   */
  @computed get showAccountBalance() {
    if (this.showAccount in this.byAccount) {
      return this.byAccount[this.showAccount].balance
    } else {
      return 0
    }
  }

  /**
   * Get accounts, their addresses and balances.
   * @function list
   */
  list() {
    rpc({ method: 'listreceivedbyaddress', params: [0, true] }, (response) => {
      if (response !== null) {
        let byAccount = {}

        response.result.map((obj) => {
          if (obj.account === '') {
            obj.account = 'Default'
          }

          if (!byAccount[obj.account]) {
            byAccount[obj.account] = {
              balance: 0,
              addresses: []
            }
          }

          byAccount[obj.account].addresses.push({
            address: obj.address,
            received: obj.amount
          })
        })

        const accounts = Object.keys(byAccount)
        const options = []

        accounts.map((account) => {
          options.push({
            method: 'getbalance',
            params: [account === 'Default' ? '' : account]
          })
        })

        rpc(options, (response) => {
          if (response !== null) {
            for (let i = 0; i < accounts.length; i++) {
              byAccount[accounts[i]].balance = response[i].result
            }

            /** Set wallet balance. */
            byAccount['#All'] = {
              balance: wallet.balance
            }

            /** Sort accounts by name. */
            accounts.sort(function(a, b) {
              if (a.toLowerCase() < b.toLowerCase()) {
                return -1
              }

              if (a.toLowerCase() > b.toLowerCase()) {
                return 1
              }

              return 0
            })

            this.setAccounts(accounts, byAccount)
          }
        })
      }
    })
  }
}

const addressBook = new AddressBook()

export default addressBook
export { AddressBook }
