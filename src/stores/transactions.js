import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'
import moment from 'moment'

/** Required store instances. */
import rpc from './rpc'
import rates from './rates'
import ui from './ui'

class Transactions {
  /**
   * Observable properties.
   * @property {map} txids - Transactions RPC responses.
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
   * @property {string} sinceBlock - List txs since this block.
   * @property {number|null} loopTimeout - setTimeout id of this.loop().
   * @property {array} categories - Grouped transaction categories.
   */
  constructor () {
    this.sinceBlock = ''
    this.loopTimeout = null
    this.categories = [
      [
        'receiving',
        'received'
      ],
      [
        'sending',
        'sent',
        'sendingToSelf',
        'sentToSelf'
      ],
      [
        'blended',
        'blending',
        'stakingReward',
        'miningReward',
        'incentiveReward'
      ]
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

    this.txids.forEach((tx, txid) => {
      /** Limit to only selected category or all categories. */
      if (
        this.showCategory === 'all' ||
        this.categories[this.showCategory].includes(tx.category) === true
      ) {
        let found = 0

        /** Calculate local amount. */
        const amountLocal = new Intl.NumberFormat(ui.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(tx.amount * rates.average * rates.local)

        /** Convert amount to local notation. */
        const amount = new Intl.NumberFormat(ui.language, {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        }).format(tx.amount)

        /** Increment found by 1 each time a filter matches. */
        this.filters.forEach((filter) => {
          if (
            tx.account.indexOf(filter) > -1 ||
            tx.address.indexOf(filter) > -1 ||
            i18next.t('wallet:' + tx.category).indexOf(filter) > -1 ||
            amount.indexOf(filter) > -1 ||
            amountLocal.indexOf(filter) > -1 ||
            tx.blockhash && tx.blockhash.indexOf(filter) > -1 ||
            tx.txid.indexOf(filter) > -1 ||
            moment(tx.time).format('l - HH:mm:ss').indexOf(filter) > -1
           ) {
            found += 1
          }
        })

        /**
         * Push tx when the length of filters array
         * and filter occurances found in a tx match.
         */
        if (found === filterCount) {
          filtered.push({
            color: tx.color,
            account: tx.account,
            address: tx.address,
            category: i18next.t('wallet:' + tx.category),
            amount: tx.amount,
            amountLocal,
            time: tx.time,
            txid: tx.txid
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
      const date = i === 0
        ? today.format('L')
        : today.subtract(1, 'day').format('L')

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

    this.txids.forEach((tx, txid) => {
      /** Check if time is in the last 31 days window. */
      if (tx.time > threshold) {
        const txDate = moment(tx.time).format('L')
        const index = dataByDate.indexOf(txDate)

        if (index > -1) {
          const category = i18next.t('wallet:' + tx.category)

          if (data[index].hasOwnProperty(category) === true) {
            data[index][category] += Math.round(Math.abs(tx.amount) * 1e6) / 1e6
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
    return this.txids.values().reduce((amount, tx) => {
      if (
        tx.confirmations === 0 &&
        tx.category === 'receiving' ||
        tx.category === 'sending' ||
        tx.category === 'sendingToSelf' ||
        tx.category === 'blending'
      ) {
        return amount + Math.abs(tx.amount)
      }

      return amount
    }, 0)
  }

  /**
   * Get pending generated txs.
   * @function pendingGenerated
   * @return {Map} Pending generated txs.
   */
  @computed get pendingGenerated () {
    return this.txids.values().reduce((txs, tx) => {
      if (
        tx.hasOwnProperty('generated') === true &&
        tx.confirmations > 0 &&
        tx.confirmations <= 220
      ) {
        txs.set(tx.txid, tx)
      }

      return txs
    }, new Map())
  }

  /**
   * Get data of the transaction being viewed.
   * @function viewingTx
   * @return {object|null} Transaction data or null.
   */
  @computed get viewingTx () {
    if (this.txids.has(this.viewing) === true) {
      return this.txids.get(this.viewing)
    }

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

      /** Re-start the loop from the last known block. */
      this.loop(this.sinceBlock)
    } else {
      this.viewing = txid

      /** Clear viewing queue if not null. */
      if (this.viewingQueue !== null) {
        this.viewingQueue = null
      }
    }
  }

  /**
   * Set transactions.
   * @function setTransactions
   * @param {array} transactions - Transactions lookups.
   * @param {array} inputs - Transactions inputs.
   */
  @action setTransactions (transactions, inputs = null) {
    /** Convert inputs array to a map for faster lookups. */
    if (inputs !== null) {
      inputs = inputs.reduce((inputs, transaction) => {
        inputs.set(transaction.result.txid, transaction.result)
        return inputs
      }, new Map())
    }

    /** Grouped notifications for pending and spendable txs. */
    let notifications = {
      pending: new Map(),
      spendable: new Map()
    }

    /** Go through transactions and make adjustments. */
    transactions.forEach((tx) => {
      tx = tx.result

      /** Get saved status. */
      const isSaved = this.txids.has(tx.txid)

      /** Determine which tx to alter. */
      let save = isSaved === false
        ? tx
        : this.txids.get(tx.txid)

      /** Update ztlock. */
      if (tx.hasOwnProperty('ztlock') === true) {
        save.ztlock = tx.ztlock
      }

      /** Skip updating if confirmations haven't changed. */
      if (isSaved === true) {
        if (save.confirmations === tx.confirmations) return
      }

      /** Set inputs only on new transactions. */
      if (inputs !== null) {
        if (isSaved === false) {
          tx.inputs = []

          for (let i = 0; i < tx.vin.length; i++) {
            const input = inputs.get(tx.vin[i].txid)

            /** Set value and address of the input transaction to each vin. */
            tx.vin[i].value = input.vout[tx.vin[i].vout].value
            tx.vin[i].address = input.vout[tx.vin[i].vout].scriptPubKey.addresses[0]

            /** Address and amount tuples for use in tables. */
            tx.inputs.push({
              address: input.vout[tx.vin[i].vout].scriptPubKey.addresses[0],
              value: input.vout[tx.vin[i].vout].value
            })
          }
        }
      }

      /** Set outputs only on new transactions. */
      if (isSaved === false) {
        /** Address and amount tuples for use in tables. */
        tx.outputs = tx.vout.reduce((outputs, output) => {
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
      save.color = tx.hasOwnProperty('generated') === true
        ? tx.confirmations < 220
          ? 'orange'
          : 'green'
        : tx.confirmations === 0
          ? 'orange'
          : tx.amount > 0
            ? 'green'
            : 'red'

      /** Convert time to miliseconds. */
      if (tx.hasOwnProperty('time') === true) {
        save.time = tx.time * 1000
      }

      /** Convert blocktime to miliseconds. */
      if (tx.hasOwnProperty('blocktime') === true) {
        save.blocktime = tx.blocktime * 1000
      }

      /** Convert timereceived to miliseconds. */
      if (tx.hasOwnProperty('timereceived') === true) {
        save.timereceived = tx.timereceived * 1000
      }

      /** Set blockhash if found in block. */
      if (tx.hasOwnProperty('blockhash') === true) {
        if (
          isSaved === false ||
          save.blockhash !== tx.blockhash
        ) {
          save.blockhash = tx.blockhash
        }
      }

      /** Process transactions with details property. */
      if (tx.hasOwnProperty('details') === true) {
        /** Process PoW, PoS and Incentive reward transactions. */
        if (tx.hasOwnProperty('generated') === true) {
          /** Set address and account. */
          if (isSaved === false) {
            save.address = tx.details[0].address
            save.account = tx.details[0].account
          }

          /** Proof-of-Stake reward. */
          if (tx.vout[0].scriptPubKey.type === 'nonstandard') {
            save.category = 'stakingReward'
          }

          if (tx.vin[0].hasOwnProperty('coinbase') === true) {
            /** Proof-of-Work reward. */
            if (tx.details[0].address === tx.vout[0].scriptPubKey.addresses[0]) {
              save.category = 'miningReward'
            }

            /** Incentive reward. */
            if (tx.details[0].address === tx.vout[1].scriptPubKey.addresses[0]) {
              save.category = 'incentiveReward'
            }
          }

          /**
           * While < 220 confirmations:
           *  - PoW: tx.amount is zero.
           *  - PoS: tx.amount is negative to the sum
           *         of output amounts - stake reward.
           *  - Incentive: tx.amount is zero.
           *
           * During this time use the correct amount from tx.details.
           */
          if (tx.confirmations < 220) {
            if (isSaved === false) save.amount = tx.details[0].amount
          }
        }

        /** Process Sent to self and Received transactions. */
        if (tx.hasOwnProperty('generated') === false) {
          /** Set address and account. */
          if (isSaved === false) {
            if (tx.details.length === 0) {
              save.address = i18next.t('wallet:multipleOutputs')
              save.account = '*'
            } else {
              save.address = tx.details[0].address
              save.account = tx.details[0].account
            }
          }

          /** Received. */
          if (tx.amount !== 0) {
            if (tx.confirmations > 0) {
              save.category = 'received'
            } else {
              save.category = 'receiving'
            }
          }

          /** Sent to self. */
          if (tx.amount === 0) {
            if (tx.confirmations > 0) {
              save.category = 'sentToSelf'
            } else {
              save.category = 'sendingToSelf'
            }

            /** Calculate the sum of amounts in details. */
            if (isSaved === false) {
              tx.details.forEach((entry) => {
                save.amount += entry.amount
              })
            }
          }
        }
      }

      /** Type: sent. */
      if (tx.hasOwnProperty('fee') === true) {
        if (tx.amount < 0) {
          /** Set address and account. */
          if (isSaved === false) {
            save.address = '/'
            save.account = ''
          }

          if (tx.confirmations > 0) {
            save.category = 'sent'
          } else {
            save.category = 'sending'
          }
        }
      }

      /** Type: blended. */
      if (tx.hasOwnProperty('blended') === true) {
        /** Set address and account. */
        if (isSaved === false) {
          save.address = '/'
          save.account = tx.txid

          /** TODO: Loop outputs and find the address that is yours. */
        }

        if (tx.confirmations > 0) {
          save.category = 'blended'
        } else {
          save.category = 'blending'
        }
      }

      /** Add pending amounts to notifications. */
      if (
        tx.confirmations === 0 &&
        tx.category !== 'sending'
      ) {
        /** Get total amount or return 0. */
        let total = notifications.pending.has(save.category) === true
          ? notifications.pending.get(save.category)
          : 0

        /** Add tx amount to the total. */
        notifications.pending.set(save.category, total + save.amount)
      }

      /** Add spendable amounts to notifications. */
      if (isSaved === true) {
        if (
          tx.confirmations === 1 ||
          tx.confirmations === 220 &&
          tx.hasOwnProperty('generated') === true
        ) {
          /** Get total amount or return 0. */
          let total = notifications.spendable.has(save.category) === true
            ? notifications.spendable.get(save.category)
            : 0

          /** Add tx amount to the total. */
          notifications.spendable.set(save.category, total + save.amount)
        }
      }

      /** Update confirmations. */
      save.confirmations = tx.confirmations

      /**
       * Add unsaved transactions to the map,
       * saved transactions update changed properties only.
       */
      if (isSaved === false) this.txids.set(save.txid, save)
    })

    /** Open notifications for pending transactions. */
    notifications.pending.forEach((total, category) => {
      /** Convert the amount to local notation. */
      total = new Intl.NumberFormat(ui.language, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
      }).format(total)

      /** Open the notification. */
      notification.info({
        message: i18next.t('wallet:' + category),
        description: total + ' XVC ' + i18next.t('wallet:toBeConfirmed'),
        duration: 6
      })
    })

    /**
     * Open notification on confirmation change,
     * from 0 -> 1 and 219 -> 220 for generated.
     */
    notifications.spendable.forEach((total, category) => {
      /** Convert the amount to local notation. */
      total = new Intl.NumberFormat(ui.language, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
      }).format(total)

      /** Open the notification. */
      notification.success({
        message: i18next.t('wallet:' + category),
        description: total + ' XVC ' + i18next.t('wallet:hasBeenConfirmed'),
        duration: 6
      })
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
   * @param {string} block - List since this blockhash.
   */
  @action setLoopTimeout (block) {
    /** Set block. */
    this.sinceBlock = block

    /** Set loop timeout using provided blockhash. */
    this.loopTimeout = setTimeout(() => {
      this.loop(block)
    }, 10 * 1000)
  }

  /**
   * Lock transaction.
   * @function ztlock
   * @param {string} txid - Txid of the transaction to lock.
   */
  ztlock (txid) {
    rpc.call([
      {
        method: 'ztlock',
        params: [txid]
      }
    ], (response) => {
      if (response !== null) {
        /** Clear current loop. */
        this.clearLoopTimeout()

        /** Re-start the loop from the last known block. */
        this.loop(this.sinceBlock)
      }
    })
  }

  /**
   * Get transactions since provided block.
   * @param {string} Previous response blockhash.
   * @function loop
   */
  loop (block = '') {
    rpc.call([
      {
        method: 'listsinceblock',
        params: [block]
      },
      {
        method: 'getrawmempool',
        params: [true]
      }
    ], (response) => {
      if (response !== null) {
        let lsb = response[0].result
        let mempool = response[1].result

        /** Start new loop. */
        this.setLoopTimeout(lsb.lastblock)

        /** Add txid of the transaction being viewed. */
        if (this.viewing !== null) {
          lsb.transactions.push({
            txid: this.viewing,
            confirmations: this.viewingTx.confirmations
          })
        }

        /** Add pending generated txs (<= 220 conf). */
        if (this.pendingGenerated.size > 0) {
          this.pendingGenerated.forEach((tx, txid) => {
            lsb.transactions.push({
              txid: tx.txid,
              confirmations: tx.confirmations
            })
          })
        }

        /** Create RPC request options array. */
        const options = lsb.transactions.reduce((options, tx) => {
          /** Exclude orphaned transactions. */
          if (tx.confirmations !== -1) {
            options.push({
              method: 'gettransaction',
              params: [tx.txid]
            })
          }

          return options
        }, [])

        if (options.length > 0) {
          /** Get transactions. */
          rpc.call(options, (txs) => {
            /* Create RPC request options array. */
            const options = txs.reduce((options, tx) => {
              tx = tx.result

              /** Make sure there are transactions in mempool. */
              if (Array.isArray(mempool) === false) {
                /** Check if this transaction exists in mempool. */
                if (mempool.hasOwnProperty(tx.txid) === true) {
                  /** Add ztlock status. */
                  tx.ztlock = mempool[tx.txid].ztlock
                }
              }

              /** Lookup inputs of unsaved txs only. */
              if (this.txids.has(tx.txid) === false) {
                tx.vin.forEach((input) => {
                  options.push({
                    method: 'gettransaction',
                    params: [input.txid]
                  })
                })
              }

              return options
            }, [])

            if (options.length === 0) {
              this.setTransactions(txs)
            } else {
              /** Lookup inputs. */
              rpc.call(options, (inputs) => {
                if (inputs !== null) {
                  this.setTransactions(txs, inputs)
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
