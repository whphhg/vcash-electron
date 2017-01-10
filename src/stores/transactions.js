import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'
import moment from 'moment'

/** Required store instances. */
import rpc from './rpc'
import rates from './rates'

class Transactions {
  /**
   * Observable properties.
   * @property {map} txids - Cleaned transaction responses.
   * @property {array} filters - Filters to limit transactions by.
   * @property {string} showCategory - Category to filter transactions by.
   * @property {string|null} viewing - Transaction being viewed.
   * @property {string|null} viewingQueue - Tx waiting to be viewed (just sent).
   */
  @observable txids = observable.map({})
  @observable filters = []
  @observable showCategory = 'all'
  @observable viewing = null
  @observable viewingQueue = null

  /**
   * @constructor
   * @property {number|null} loopTimeout - setTimeout id of this.loop().
   * @property {array} categories - Grouped transaction categories.
   */
  constructor () {
    this.loopTimeout = null
    this.categories = [
      ['receiving', 'received'],
      ['sending', 'sent', 'sendingToSelf', 'sentToSelf'],
      ['blended', 'blending', 'stakingReward', 'miningReward', 'incentiveReward']
    ]

    /** When RPC status changes. */
    reaction(() => rpc.status, (status) => {
      /** Clear previous this.loop() setTimeout. */
      if (this.loopTimeout !== null) this.clearLoopTimeout()

      /** Start update loop when RPC becomes available. */
      if (status === true) this.loop()
    })

    /** Check if there's a sent transaction waiting to be viewed. */
    reaction(() => this.txids.size, (size) => {
      if (this.viewingQueue !== null) {
        this.setViewing(this.viewingQueue)
      }
    })
  }

  /**
   * Get filtered transactions.
   * @function filtered
   * @return {array} Transactions with filters applied.
   */
  @computed get filtered () {
    const filterCount = this.filters.length
    let filtered = []

    this.txids.forEach((transaction, txid) => {
      /** Limit to only selected category or all categories. */
      if (
        this.showCategory === 'all' ||
        this.categories[this.showCategory].includes(transaction.category) === true
      ) {
        let found = 0

        /** Calculate local amount. */
        const amountLocal = parseFloat(transaction.amount * rates.average * rates.local)

        /** Increment found by 1 each time a filter matches. */
        this.filters.forEach((filter) => {
          if (
            transaction.account && transaction.account.indexOf(filter) > -1 ||
            transaction.address && transaction.address.indexOf(filter) > -1 ||
            transaction.category && i18next.t('wallet:' + transaction.category).indexOf(filter) > -1 ||
            transaction.amount && String(transaction.amount.toFixed(6)).indexOf(filter) > -1 ||
            amountLocal && String(amountLocal.toFixed(2)).indexOf(filter) > -1 ||
            transaction.blockhash && transaction.blockhash.indexOf(filter) > -1 ||
            transaction.txid && transaction.txid.indexOf(filter) > -1 ||
            transaction.time && moment(transaction.time).format('l - HH:mm:ss').indexOf(filter) > -1
           ) {
            found += 1
          }
        })

        /** Push tx when the length of filters array and filter occurances found in a tx match. */
        if (found === filterCount) {
          filtered.push({
            color: transaction.color,
            account: transaction.account,
            address: transaction.address,
            category: i18next.t('wallet:' + transaction.category),
            amount: transaction.amount,
            amountLocal,
            time: transaction.time,
            txid: transaction.txid
          })
        }
      }
    })

    /** Sort by date. */
    return filtered.sort((a, b) => {
      if (a.time > b.time) return -1
      if (a.time < b.time) return 1
      return 0
    })
  }

  /**
   * Get transactions data in a format that Recharts can read.
   * @function chartData
   * @return {array} Chart data.
   */
  @computed get chartData () {
    /** Today - 31 days. */
    const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000)

    const today = moment(new Date())
    let data = []
    let dataByDate = []

    for (let i = 0; i < 31; i++) {
      const date = i === 0 ? today.format('L') : today.subtract(1, 'day').format('L')

      /** Add to the beginning of arrays. */
      dataByDate.unshift(date)
      data.unshift({
        date,
        [i18next.t('wallet:sent')]: 0,
        [i18next.t('wallet:received')]: 0,
        [i18next.t('wallet:stakingReward')]: 0,
        [i18next.t('wallet:miningReward')]: 0,
        [i18next.t('wallet:incentiveReward')]: 0
      })
    }

    this.txids.forEach((transaction, txid) => {
      /** Check if time is in the last 31 days window. */
      if (transaction.time > threshold) {
        const txDate = moment(transaction.time).format('L')
        const index = dataByDate.indexOf(txDate)

        if (index > -1) {
          const category = i18next.t('wallet:' + transaction.category)

          if (data[index].hasOwnProperty(category) === true) {
            data[index] = {
              ...data[index],
              [category]: parseFloat(parseFloat(data[index][category] + Math.abs(transaction.amount)).toFixed(6))
            }
          }
        }
      }
    })

    return data
  }

  /**
   * Get pending amount.
   * @function pendingAmount
   * @return {number} Amount pending.
   */
  @computed get pendingAmount () {
    let pending = 0

    this.txids.forEach((transaction, txid) => {
      if (transaction.confirmations === 0) {
        if (
          transaction.category === 'receiving' ||
          transaction.category === 'sending' ||
          transaction.category === 'sendingToSelf' ||
          transaction.category === 'blending'
        ) {
          pending += Math.abs(transaction.amount)
        }
      }
    })

    return pending
  }

  /**
   * Get data of the transaction being viewed.
   * @function viewingTx
   * @return {object|null} Transaction data or null.
   */
  @computed get viewingTx () {
    if (this.txids.has(this.viewing) === true) return this.txids.get(this.viewing)
    return null
  }

  /**
   * Set txid of the transaction being viewed.
   * @function setViewing
   * @param {string} txid - Transaction id.
   */
  @action setViewing (txid = null) {
    /** Lookup a transaction that was just sent. */
    if (
      txid !== null &&
      this.txids.has(txid) === false
    ) {
      /** Save the txid in viewing queue. */
      this.viewingQueue = txid

      /** Clear current loop. */
      this.clearLoopTimeout()

      /** Re-start the loop. */
      this.loop()
    } else {
      this.viewing = txid

      /** Clear viewing queue if not null. */
      if (this.viewingQueue !== null) this.viewingQueue = null
    }
  }

  /**
   * Set transactions.
   * @function setTransactions
   * @param {array} transactions - Array of gettransaction RPC responses for listsinceblock txids.
   * @param {array|object} mempool - Empty array or object of transactions in mempool.
   * @param {array} inputs - Array of gettransaction RPC responses for transactions inputs.
   */
  @action setTransactions (transactions, mempool, inputs = null) {
    /** Convert inputs array to a map for faster lookups. */
    if (inputs !== null) {
      inputs = inputs.reduce((inputs, transaction) => {
        inputs.set(transaction.result.txid, transaction.result)
        return inputs
      }, new Map())
    }

    /** Go through transactions and make adjustments. */
    transactions.forEach((transaction) => {
      transaction = transaction.result

      /** Exclude orphaned transactions. */
      if (transaction.confirmations === -1) return

      /** Get saved status. */
      const isSaved = this.txids.has(transaction.txid)

      /** Get saved transaction data. */
      let savedTransaction = isSaved === true && this.txids.get(transaction.txid)

      /** Determine which variable to alter. */
      let save = isSaved === false ? transaction : savedTransaction

      /** Set ztlock. */
      if (Array.isArray(mempool) === false) {
        if (mempool.hasOwnProperty(transaction.txid) === true) {
          save.ztlock = mempool[transaction.txid].ztlock
        }
      }

      /** Check confirmations of saved transactions to avoid needless updating. */
      if (isSaved === true) {
        /** Skip updating if confirmations haven't changed. */
        if (savedTransaction.confirmations === transaction.confirmations) return
      }

      /** Set inputs only on new transactions to avoid needless updating. */
      if (inputs !== null) {
        if (isSaved === false) {
          transaction.inputs = []

          for (let i = 0; i < transaction.vin.length; i++) {
            const input = inputs.get(transaction.vin[i].txid)

            /** Add value and address of the input transaction to each vin. */
            transaction.vin[i] = {
              ...transaction.vin[i],
              value: input.vout[transaction.vin[i].vout].value,
              address: input.vout[transaction.vin[i].vout].scriptPubKey.addresses[0]
            }

            /** Address and amount tuples for use in tables. */
            transaction.inputs.push({
              address: input.vout[transaction.vin[i].vout].scriptPubKey.addresses[0],
              value: input.vout[transaction.vin[i].vout].value
            })
          }
        }
      }

      /** Set outputs only on new transactions to avoid needless updating. */
      if (isSaved === false) {
        /** Address and amount tuples for use in tables. */
        transaction.outputs = transaction.vout.reduce((outputs, output) => {
          if (output.scriptPubKey.type !== 'nonstandard') {
            outputs.push({
              address: output.scriptPubKey.addresses[0],
              value: output.value
            })
          }

          return outputs
        }, [])
      }

      /** Determine amount color. */
      save.color = transaction.hasOwnProperty('generated') === true
        ? transaction.confirmations < 220
          ? 'orange'
          : 'green'
        : transaction.confirmations === 0
          ? 'orange'
          : transaction.amount > 0
            ? 'green'
            : 'red'

      /** Convert time to miliseconds. */
      if (transaction.hasOwnProperty('time') === true) {
        save.time = transaction.time * 1000
      }

      /** Convert blocktime to miliseconds. */
      if (transaction.hasOwnProperty('blocktime') === true) {
        save.blocktime = transaction.blocktime * 1000
      }

      /** Convert timereceived to miliseconds. */
      if (transaction.hasOwnProperty('timereceived') === true) {
        save.timereceived = transaction.timereceived * 1000
      }

      /** Set blockhash if getting confirmed. */
      if (transaction.hasOwnProperty('blockhash') === true) {
        save.blockhash = transaction.blockhash
      }

      /** Process transactions with details property. */
      if (transaction.hasOwnProperty('details') === true) {
        /** Process PoW, PoS and Incentive reward transactions. */
        if (transaction.hasOwnProperty('generated') === true) {
          /** Set address and account. */
          if (isSaved === false) {
            save.address = transaction.details[0].address
            save.account = transaction.details[0].account
          }

          /** Proof-of-Stake reward. */
          if (transaction.vout[0].scriptPubKey.type === 'nonstandard') {
            save.category = 'stakingReward'
          }

          if (transaction.vin[0].hasOwnProperty('coinbase') === true) {
            /** Proof-of-Work reward. */
            if (transaction.details[0].address === transaction.vout[0].scriptPubKey.addresses[0]) {
              save.category = 'miningReward'
            }

            /** Incentive reward. */
            if (transaction.details[0].address === transaction.vout[1].scriptPubKey.addresses[0]) {
              save.category = 'incentiveReward'
            }
          }

          /**
           * While < 220 confirmations:
           *  - PoW: transaction.amount is zero.
           *  - PoS: transaction.amount is negative to the sum of output amounts - stake reward.
           *  - Incentive: transaction.amount is zero.
           *
           * During this time use the correct amount from transaction.details.
           */
          if (transaction.confirmations < 220) {
            if (isSaved === false) save.amount = transaction.details[0].amount
          }
        }

        /** Process Sent to self and Received transactions. */
        if (transaction.hasOwnProperty('generated') === false) {
          /** Set address and account. */
          if (isSaved === false) {
            if (transaction.details.length === 0) {
              save.address = i18next.t('wallet:multipleOutputs')
              save.account = '*'
            } else {
              save.address = transaction.details[0].address
              save.account = transaction.details[0].account
            }
          }

          /** Received. */
          if (transaction.amount !== 0) {
            if (transaction.confirmations > 0) {
              save.category = 'received'
            } else {
              save.category = 'receiving'
            }
          }

          /** Sent to self. */
          if (transaction.amount === 0) {
            if (transaction.confirmations > 0) {
              save.category = 'sentToSelf'
            } else {
              save.category = 'sendingToSelf'
            }

            /** Calculate the sum of amounts in details. */
            if (isSaved === false) {
              transaction.details.forEach((entry) => {
                save.amount += entry.amount
              })
            }
          }
        }
      }

      /** Type: sent. */
      if (transaction.hasOwnProperty('fee') === true) {
        if (transaction.amount < 0) {
          /** Set address and account. */
          if (isSaved === false) {
            save.address = '/'
            save.account = ''
          }

          if (transaction.confirmations > 0) {
            save.category = 'sent'
          } else {
            save.category = 'sending'
          }
        }
      }

      /** Type: blended. */
      if (transaction.hasOwnProperty('blended') === true) {
        /** Set address and account. */
        if (isSaved === false) {
          save.address = '/'
          save.account = transaction.txid
        }

        if (transaction.confirmations > 0) {
          save.category = 'blended'
        } else {
          save.category = 'blending'
        }
      }

      /** Open notification if transaction is pending. */
      if (
        transaction.confirmations === 0 &&
        transaction.category !== 'sending'
      ) {
        notification.info({
          message: i18next.t('wallet:' + save.category),
          description: save.amount.toFixed(6) + ' XVC ' + i18next.t('wallet:toBeConfirmed'),
          duration: 6
        })
      }

      /** Open notification on confirmation change from 0 -> 1 and 219 -> 220 for generated. */
      if (
        transaction.confirmations === 1 ||
        transaction.confirmations === 220 &&
        transaction.hasOwnProperty('generated') === true
      ) {
        notification.success({
          message: i18next.t('wallet:' + save.category),
          description: save.amount.toFixed(6) + ' XVC ' + i18next.t('wallet:isNowSpendable'),
          duration: 6
        })
      }

      /** Update confirmations. */
      save.confirmations = transaction.confirmations

      /** Add unsaved transactions to the map (saved transactions update changed properties only). */
      if (isSaved === false) this.txids.set(save.txid, save)
    })
  }

  /**
   * Set transactions filters.
   * @function setFilters
   * @param {string} filters - Filters entered in the input box.
   */
  @action setFilters (filters) {
    this.filters = filters.split(' ').filter((filter) => {
      return filter !== ''
    })
  }

  /**
   * Set show transactions category.
   * @function setShowCategory
   * @param {string} showSince - Show only transactions of this category.
   */
  @action setShowCategory (showCategory) {
    this.showCategory = showCategory
  }

  /**
   * Clear current loop timeout.
   * @function clearLoop
   */
  @action clearLoopTimeout () {
    clearTimeout(this.loopTimeout)
    this.loopTimeout = null
  }

  /**
   * Start new loop timeout and save its id.
   * @function setLoopTimeout
   */
  @action setLoopTimeout (block) {
    this.loopTimeout = setTimeout(() => {
      this.loop(block)
    }, 15 * 1000)
  }

  /**
   * Lock transaction.
   * @function transactionLock
   * @param {string} txid - Txid of the transaction to lock.
   */
  transactionLock (txid) {
    rpc.call([
      {
        method: 'ztlock',
        params: [txid]
      }
    ], (response) => {
      if (response !== null) {
        /** */
      }
    })
  }

  /**
   * Get transactions and their inputs since provided block.
   * @param {string} Previous response blockhash.
   * @function loop
   */
  loop (block = '') {
    /** 00. Get confirmed transactions since provided block and mempool. */
    rpc.call([
      { method: 'listsinceblock', params: [block] },
      { method: 'getrawmempool', params: [true] }
    ], (response) => {
      if (response !== null) {
        let uniqueTxids = new Set()
        let mempool = {}

        /** Start new loop. */
        this.setLoopTimeout(response[0].result.lastblock)

        /** Add txid of the transaction being viewed. */
        if (this.viewing !== null) {
          response[0].result.transactions.push({
            txid: this.viewing
          })
        }

        /** Add generated txids with less than 220 confirmations. */
        this.txids.forEach((transaction, txid) => {
          if (transaction.hasOwnProperty('generated') === true) {
            if (transaction.confirmations > 0) {
              if (transaction.confirmations <= 220) {
                response[0].result.transactions.push({
                  txid: transaction.txid
                })
              }
            }
          }
        })

        /** Get unique txid gettransaction RPC requests. */
        const options = response[0].result.transactions.reduce((options, transaction) => {
          /** Check if this txid has been added before. */
          if (uniqueTxids.has(transaction.txid) === false) {
            /** Add new unique txid. */
            uniqueTxids.add(transaction.txid)

            /** Make sure there are transactions in mempool. */
            if (Array.isArray(response[1].result) === false) {
              /** Check if this transaction exists in mempool. */
              if (response[1].result.hasOwnProperty(transaction.txid) === true) {
                mempool[transaction.txid] = response[1].result[transaction.txid]
              }
            }

            /** Push new RPC option. */
            options.push({
              method: 'gettransaction',
              params: [transaction.txid]
            })
          }

          return options
        }, [])

        /** 01. Lookup transactions. */
        if (options.length > 0) {
          rpc.call(options, (transactions) => {
            let uniqueInputs = new Set()

            const options = transactions.reduce((options, transaction) => {
              transaction = transaction.result

              if (this.txids.has(transaction.txid) === false) {
                /** Get unique input gettransaction RPC requests. */
                transaction.vin.forEach((input) => {
                  /** Check if this input has been added before. */
                  if (uniqueInputs.has(input.txid) === false) {
                    /** Add new unique input. */
                    uniqueInputs.add(input.txid)

                    /** Push new RPC option. */
                    options.push({
                      method: 'gettransaction',
                      params: [input.txid]
                    })
                  }
                })
              }

              return options
            }, [])

            /** 02. Lookup inputs. */
            if (options.length === 0) {
              this.setTransactions(transactions, mempool)
            } else {
              rpc.call(options, (inputs) => {
                if (inputs !== null) {
                  this.setTransactions(transactions, mempool, inputs)
                }
              })
            }
          })
        }
      }
    })
  }
}

/** Initialize a new globally used store. */
const transactions = new Transactions()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default transactions
export { Transactions }
