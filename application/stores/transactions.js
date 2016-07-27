import { action, computed, observable } from 'mobx'
import rpc from '../utilities/rpc'
import moment from 'moment'

/** Required store instances. */
import addressBook from './addressBook'
import rates from './rates'

/**
 * TODO: Combine self-sends and correctly handle category names, similar to WebUI.
 *       - Sending -> Sent, Receiving -> Received, Blended, Immature, PoS, PoW, Incentive
 * TODO: Implement balance tracking of individual addresses and accounts.
 * NOTE: RPC getbalance incorrect IF using RPC sendtoaddress. Ok if only RPC sendmany is used on a fresh wallet.
 *       - Affects: ADDRESS_BOOK, TRANSACTIONS, TRANSACTION_, SEND_
 */

/** Transactions store class. */
class Transactions {
  @observable amountUnconfirmed
  @observable confirmed
  @observable filters
  @observable showSince
  @observable showCategory
  @observable unconfirmed

  /**
   * Prepare observable variables and run RPC list function.
   * @constructor
   * @property {number} amountUnconfirmed - Sum of unconfirmed transactions.
   * @property {array} confirmed - Confirmed transactions objects.
   * @property {array} filters - Filters entered in the input box.
   * @property {string} showSince - Show only transactions after this date.
   * @property {string} showCategory - Show only transactions of this category.
   * @property {array} unconfirmed - Unconfirmed transactions objects.
   */
  constructor() {
    this.amountUnconfirmed = 0
    this.confirmed = []
    this.filters = []
    this.showSince = new Date(moment().subtract(20, 'days').calendar())
    this.showCategory = 'all'
    this.unconfirmed = []

    this.list()
  }

  /**
   * Set transactions filters.
   * @function setFilters
   * @param {string} filters - Filters entered in the input box.
   */
  @action setFilters(filters) {
    this.filters = filters.split(' ').filter((filter) => {
      return filter !== ''
    })
  }

  /**
   * Set show transactions since.
   * @function setShowSince
   * @param {number} showSince - Show only transactions after this date.
   */
  @action setShowSince(showSince) {
    this.showSince = showSince
  }

  /**
   * Set show transactions category.
   * @function setShowCategory
   * @param {string} showSince - Show only transactions of this category.
   */
  @action setShowCategory(showCategory) {
    this.showCategory = showCategory
  }

  /**
   * Set new transactions total and unconfirmed amount.
   * @function setTransactions
   * @param {array} confirmed - New confirmed transactions.
   * @param {array} unconfirmed - New unconfirmed transactions.
   * @param {number} amountUnconfirmed - Total unconfirmed amount.
   */
  @action setTransactions(confirmed, unconfirmed, amountUnconfirmed) {
    this.confirmed = [...this.confirmed, ...confirmed]
    this.unconfirmed = unconfirmed
    this.amountUnconfirmed = amountUnconfirmed
  }

  /**
   * Get transactions data in a format that recharts can read.
   * @function chartData
   * @return {array} Chart data.
   */
  @computed get chartData() {
    const today = moment(new Date())
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000) /** Today - 31 days. */
    let data = []
    let dataByDate = []

    for (let i = 0; i < 31; i++) {
      const date = i === 0 ? today.format('L') : today.subtract(1, 'day').format('L')

      dataByDate.unshift(date)
      data.unshift({
        date,
        send: 0,
        receive: 0,
        generate: 0,
        immature: 0
      })
    }

    this.confirmed.reduce((data, tx) => {
      /** Check if time is in the last 31 days window. */
      if (tx.time * 1000 > threshold) {
        const txDate = moment(tx.time * 1000).format('L')
        const index = dataByDate.indexOf(txDate)

        if (index > -1) {
          data[index] = {
            ...data[index],
            [tx.category]: parseFloat(parseFloat(data[index][tx.category] + Math.abs(tx.amount)).toFixed(6))
          }
        }
      }

      return data
    }, data)

    return data
  }

  /**
   * Get filtered transactions.
   * @function filtered
   * @return {array} Transactions with filters applied.
   */
  @computed get filtered() {
    const threshold = moment(this.showSince).unix()
    let transactions = [...this.confirmed, ...this.unconfirmed]

    transactions = transactions.reduce((transactions, tx) => {
      /** Show only transactions since provided date. */
      if (tx.time > threshold) {
        /** Show only selected category or all categories. */
        if (tx.category === this.showCategory || this.showCategory === 'all') {
          /** Set local amount. */
          tx.amountLocal = parseFloat(tx.amount * rates.average * rates.local)

          /** Filter, if set. */
          if (this.filters.length > 0) {
            let found = 0

            /** Increment found by 1 each time a filter matches. */
            this.filters.forEach((filter) => {
              if (tx.account && tx.account.indexOf(filter) > -1 ||
                  tx.address && tx.address.indexOf(filter) > -1 ||
                  tx.category && tx.category.indexOf(filter) > -1 ||
                  tx.amount && String(tx.amount.toFixed(6)).indexOf(filter) > -1 ||
                  tx.amountLocal && String(tx.amountLocal.toFixed(2)).indexOf(filter) > -1 ||
                  tx.blockhash && tx.blockhash.indexOf(filter) > -1 ||
                  tx.txid && tx.txid.indexOf(filter) > -1 ||
                  tx.time && moment(new Date(tx.time * 1000)).format('YYYY-MM-DD - HH:mm:ss').indexOf(filter) > -1)
              {
                found += 1
              }
            })

            /** Push tx when the length of filters array and filter occurances found in a tx match. */
            if (found === this.filters.length) {
              transactions.push(tx)
            }
          } else {
            transactions.push(tx)
          }
        }
      }

      return transactions
    }, [])

    /** Sort by date. */
    transactions = transactions.sort((a, b) => {
      return parseInt(b.time) - parseInt(a.time)
    })

    return transactions
  }

  /**
   * Get transactions since provided block.
   * @function list
   */
  list(lastBlock = '') {
    rpc({ method: 'listsinceblock', params: [lastBlock] }, (response) => {
      if (response !== null) {
        const newTransactions = response.result.transactions
        let amountUnconfirmed = 0
        let confirmed = []
        let unconfirmed = []
        let update = false

        if (newTransactions.length > 0) {
          newTransactions.map((tx) => {
            if (tx.confirmations > 0) {
              confirmed.push(tx)
            } else {
              unconfirmed.push(tx)
              amountUnconfirmed += Math.abs(tx.amount)
            }
          })

          /** Skip comparing and update if there are confirmed transactions. */
          if (confirmed.length > 0) {
            update = true
          }

          /** Compare unconfirmed with those in state. Update if they differ. */
          if (!update) {
            try {
              for (let i = 0; i < unconfirmed.length; i++) {
                if (unconfirmed[i].txid !== this.unconfirmed[i].txid) {
                  update = true
                  break
                }
              }
            } catch (exception) {
              update = true
            }
          }
        }

        process.env.NODE_ENV === 'dev' && console.info('Transactions:',confirmed.length,'confirmed,',unconfirmed.length,'unconfirmed since block "'+lastBlock+'", next in 15s.')

        if (update) {
          this.setTransactions(confirmed, unconfirmed, amountUnconfirmed)

          if (confirmed.length > 0) {
            addressBook.list()
          }
        }
      }

      setTimeout(() => { this.list(response ? response.result.lastblock : lastBlock) }, 15 * 1000)
    })
  }
}

const transactions = new Transactions()

export default transactions
export { Transactions }
