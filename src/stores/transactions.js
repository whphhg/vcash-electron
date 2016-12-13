import { action, asMap, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import moment from 'moment'

/** Required store instances. */
import rpc from './rpc'
import rates from './rates'

class Transactions {
  /**
   * Observable properties.
   * @property {array} response - listsinceblock RPC response.
   * @property {map} txids - gettransaction RPC responses of listsinceblock RPC txids.
   * @property {map} inputs - gettransaction RPC responses of listsinceblock RPC txids inputs (vin).
   * @property {array} filters - Transactions displaying filters.
   * @property {string} showCategory - Show only transactions of this category.
   */
  @observable response = []
  @observable txids = asMap({})
  @observable inputs = asMap({})
  @observable filters = []
  @observable showCategory = 'all'

  constructor() {
    this.categories = [
      ['received'],
      ['sent', 'sent to self'],
      ['blended', 'staking reward', 'mining reward', 'incentive reward']
    ]

    /** Start update loop when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) this.listsinceblock()
    })

    /** Lookup transactions on listsinceblock RPC response. */
    reaction(() => this.response, (response) => {
      let promises = []

      /** Get unique txids. */
      let unique = response.reduce((unique, tx) => {
        unique.add(tx.txid)
        return unique
      }, new Set())

      /** Add pending generated. */
      unique = [...unique, ...this.pendingGenerated]

      unique.forEach((txid) => {
        promises.push(
          new Promise((resolve, reject) => {
            rpc.call([{ method: 'gettransaction', params: [txid] }], (response) => {
              if (response !== null) {
                resolve(response[0].result)
              } else {
                reject(txid)
              }
            })
          })
        )
      })

      if (promises.length > 0) {
        Promise.all(promises)
          .then(response => { this.setTxids(response) })
          .catch(error => { process.env.NODE_ENV === 'dev' && console.error('Promises: Transactions lookups error.', error) })
      }
    })
  }

  /**
   * Get all transactions in a table friendly format.
   * @function list
   * @return {array} Array of transaction objects.
   */
  @computed get list() {
    let transactions = []

    this.txids.forEach((transaction, txid) => {
      let category = ''
      let type = ''
      let amount = transaction.amount

      /** Type: received & sent to self. */
      if (transaction.hasOwnProperty('details') === true) {
        category = 'received'

        if (transaction.confirmations > 0) {
          type = 'Received'
        } else {
          type = 'Receiving (0/1)'
        }

        if (transaction.amount === 0) {
          category = 'sent to self'

          if (transaction.confirmations > 0) {
            type = 'Sent to self'
          } else {
            type = 'Sending to self (0/1)'
          }

          transaction.details.forEach((entry) => {
            amount += entry.amount
          })
        }
      }

      /** Type: sent. */
      if (transaction.hasOwnProperty('fee') === true) {
        if (transaction.amount < 0) {
          category = 'sent'

          if (transaction.confirmations > 0) {
            type = 'Sent'
          } else {
            type = 'Sending (0/1)'
          }
        }
      }

      /** Type: blended. */
      if (transaction.hasOwnProperty('blended') === true) {
        category = 'blended'

        if (transaction.confirmations > 0) {
          type = 'Blended'
        } else {
          type = 'Blending (0/1)'
        }

        /** TODO: Count amounts */
      }

      /** Type: generated. */
      if (transaction.hasOwnProperty('generated') === true) {
        /** Proof-of-Stake reward. */
        if (transaction.vout[0].scriptPubKey.type === 'nonstandard') {
          category = 'staking reward'

          if (transaction.confirmations > 220) {
            type = 'Staking reward'
          } else {
            type = 'Staking reward (' + transaction.confirmations + '/220)'

            transaction.vout.forEach((entry) => {
              amount += entry.value
            })
          }
        }

        /** Incentive reward. */
        if (transaction.vin[0].hasOwnProperty('coinbase') === true) {
          category = 'incentive reward'

          if (transaction.confirmations > 220) {
            type = 'Incentive reward'
          } else {
            type = 'Incentive reward (' + transaction.confirmations + '/220)'

            transaction.details.forEach((entry) => {
              amount += entry.amount
            })
          }
        }

        /** TODO: Proof-of-Work reward. */
      }

      transactions.push({
        time: transaction.time * 1000,
        type,
        category,
        confirmations: transaction.confirmations,
        txid: transaction.txid,
        amount,
        amountLocal: parseFloat(amount * rates.average * rates.local),
        blockhash: transaction.blockhash
      })
    })

    /** Sort by date. */
    return transactions.sort((a, b) => {
      if (a.time > b.time) return -1
      if (a.time < b.time) return 1
      return 0
    })
  }

  /**
   * Get filtered transactions.
   * @function filtered
   * @return {array} Transactions with filters applied.
   */
  @computed get filtered() {
    /** Return sorted list if there are no filters present. */
    if (this.filters.length < 0) {
      if (this.showCategory === 'all') return this.list
    }

    /** Return filtered list if there are filters present. */
    return this.list.reduce((filtered, tx) => {
      /** Show only selected category or all categories. */
      if (this.showCategory === 'all' || this.categories[this.showCategory].includes(tx.category)) {
        let found = 0

        /** Increment found by 1 each time a filter matches. */
        this.filters.forEach((filter) => {
          if (
            //tx.account && tx.account.indexOf(filter) > -1 ||
            //tx.address && tx.address.indexOf(filter) > -1 ||
            tx.type && tx.type.indexOf(filter) > -1 ||
            tx.amount && String(tx.amount.toFixed(6)).indexOf(filter) > -1 ||
            tx.amountLocal && String(tx.amountLocal.toFixed(2)).indexOf(filter) > -1 ||
            tx.blockhash && tx.blockhash.indexOf(filter) > -1 ||
            tx.txid && tx.txid.indexOf(filter) > -1 ||
            tx.time && moment(new Date(tx.time)).format('YYYY-MM-DD - HH:mm:ss').indexOf(filter) > -1
           ) {
            found += 1
          }
        })

        /** Push tx when the length of filters array and filter occurances found in a tx match. */
        if (found === this.filters.length) {
          filtered.push(tx)
        }
      }

      return filtered
    }, [])
  }

  /**
   * Get transactions data in a format that Recharts can read.
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

      /** Add to the beginning of arrays. */
      dataByDate.unshift(date)
      data.unshift({
        date,
        'Sent': 0,
        'Received': 0,
        'Staking reward': 0,
        'Mining reward': 0,
        'Incentive reward': 0
      })
    }

    this.list.reduce((data, tx) => {
      /** Check if time is in the last 31 days window. */
      if (tx.time > threshold) {
        const txDate = moment(tx.time).format('L')
        const index = dataByDate.indexOf(txDate)

        if (index > -1) {
          /** Capitalize first letter of the category. */
          const category = tx.category.charAt(0).toUpperCase() + tx.category.slice(1)

          if (data[index].hasOwnProperty(category) === true) {
            data[index] = {
              ...data[index],
              [category]: parseFloat(parseFloat(data[index][category] + Math.abs(tx.amount)).toFixed(6))
            }
          }
        }
      }

      return data
    }, data)

    return data
  }

  /**
   * Get pending amount.
   * @function pendingAmount
   * @return {number} Amount pending.
   */
  @computed get pendingAmount() {
    let pending = 0

    this.list.forEach((transaction) => {
      if (transaction.confirmations === 0) {
        if (
          transaction.category === 'received' ||
          transaction.category === 'sent' ||
          transaction.category === 'sent to self' ||
          transaction.category === 'blended'
        ) {
          pending += Math.abs(transaction.amount)
        }
      }
    })

    return pending
  }

  /**
   * Get generated txids with less than 220 confirmations.
   * @function pendingGenerated
   * @return {number} Pending generated txids.
   */
  @computed get pendingGenerated() {
    let pending = new Set()

    this.txids.forEach((transaction, txid) => {
      if (transaction.hasOwnProperty('generated') === true) {
        if (transaction.confirmations <= 220) pending.add(txid)
      }
    })

    return pending
  }

  /**
   * Set listsinceblock RPC response.
   * @function setResponse
   * @param {array} response - listsinceblock RPC response.
   */
  @action setResponse(response) {
    this.response = response
  }

  /**
   * Set transactions.
   * @function setTxids
   * @param {array} response - gettransaction RPC responses.
   */
  @action setTxids(response) {
    response.forEach((tx) => {
      this.txids.set(tx.txid, tx)
    })
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
   * Set show transactions category.
   * @function setShowCategory
   * @param {string} showSince - Show only transactions of this category.
   */
  @action setShowCategory(showCategory) {
    this.showCategory = showCategory
  }

  /**
   * Get transactions since provided block.
   * @param {string} block - List since this block.
   * @function listsinceblock
   */
  listsinceblock(block = '') {
    rpc.call([{ method: 'listsinceblock', params: [block] }], (response) => {
      if (response !== null) {
        this.setResponse(response[0].result.transactions)
      }

      setTimeout(() => {
        this.listsinceblock(response ? response[0].result.lastblock : block)
      }, 15 * 1000)
    })
  }
}

/** Initialize a new globally used store. */
const transactions = new Transactions()

/** Export both, initialized store as default export, and store class as named export. */
export default transactions
export { Transactions }
