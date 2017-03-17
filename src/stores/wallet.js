import { action, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import { shortUid } from '../utilities/common'
import i18next from '../utilities/i18next'
import moment from 'moment'

/** Required store instances. */
import rpc from './rpc'
import rates from './rates'
import ui from './ui'

class Wallet {
  /**
   * Observable properties.
   * @property {map} addresses - Wallet label and change addresses.
   * @property {map} transactions - Wallet transactions.
   * @property {map} outputs - Outputs available to be spent.
   */
  @observable addresses = observable.map({})
  @observable transactions = observable.map({})
  @observable outputs = observable.map({})

  @observable search = observable.array([])
  @observable viewing = null
  @observable viewingQueue = null

  /**
   * @constructor
   * @property {number|null} updateTimeout - getTransactions() setTimeout id.
   * @property {string} lastBlock - Last looked up block.
   */
  constructor () {
    this.updateTimeout = null
    this.lastBlock = ''

    /** When RPC becomes available: */
    reaction(() => rpc.status, (status) => {
      if (status === true) {
        /** Update transactions. */
        this.getTransactions()

        /** Update addresses. */
        this.getAddresses()
      }
    })

    /** Check if there's a sent transaction waiting to be viewed. */
    reaction(() => this.transactions.size, (size) => {
      if (this.viewingQueue !== null) {
        this.setViewing(this.viewingQueue)
      }
    })
  }

  /**
   * Get a list of account names in alphabetical order.
   * @function accounts
   * @return {array} Account list.
   */
  @computed get accounts () {
    let accounts = new Set()

    /** Add accounts to the set. */
    this.addresses.forEach((address) => {
      if (address.account !== '') {
        accounts.add(address.account)
      }
    })

    /** Convert Set to Array. */
    accounts = [...accounts]

    /** Return accounts in ASC order. */
    return accounts.sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return -1
      if (a.toLowerCase() > b.toLowerCase()) return 1
      return 0
    })
  }

  /**
   * Get a list of addresses.
   * @function addressList
   * @return {array} Address list.
   */
  @computed get addressList () {
    return [...this.addresses.keys()]
  }

  /**
   * Get addresses data.
   * @function addressData
   * @return {array} Addresses data.
   */
  @computed get addressData () {
    return [...this.addresses.values()]
  }

  /**
   * Get generated transactions.
   * @function generated
   * @return {array} Generated transactions.
   */
  @computed get generated () {
    let generated = []

    this.transactions.forEach((tx, txid) => {
      if (tx.hasOwnProperty('generated') === true) {
        generated.push(tx)
      }
    })

    /** Return generated in ASC order. */
    return generated.reverse()
  }

  /**
   * Get pending generated transactions.
   * @function generatedPending
   * @return {map} Generated pending transactions.
   */
  @computed get generatedPending () {
    return this.generated.reduce((pending, tx) => {
      if (
        tx.confirmations > 0 &&
        tx.confirmations <= 220
      ) {
        pending.set(tx.txid, tx)
      }

      return pending
    }, new Map())
  }

  /**
   * Get pending amount.
   * @function pendingAmount
   * @return {number} Amount pending.
   */
  @computed get pendingAmount () {
    let pending = 0

    this.transactions.forEach((tx, txid) => {
      if (
        tx.confirmations === 0 && (
          tx.category === 'receiving' ||
          tx.category === 'sending' ||
          tx.category === 'sendingToSelf' ||
          tx.category === 'blending'
        )
      ) {
        pending = pending + Math.abs(tx.amount)
      }
    })

    return pending
  }

  /**
   * Get transactions data.
   * @function transactionsData
   * @return {array} Transactions data.
   */
  @computed get transactionsData () {
    let txs = []

    this.transactions.forEach((tx, txid) => {
      let keywordMatches = 0

      const amount = new Intl.NumberFormat(ui.language, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
      }).format(tx.amount)

      const amountLocal = new Intl.NumberFormat(ui.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(tx.amount * rates.average * rates.local)

      /** Increment keywordMatches by 1 each time a keyword matches. */
      this.search.forEach((keyword) => {
        if (
          amount.indexOf(keyword) > -1 ||
          amountLocal.indexOf(keyword) > -1 ||
          i18next.t('wallet:' + tx.category).indexOf(keyword) > -1 ||
          (tx.blockhash && tx.blockhash.indexOf(keyword) > -1) ||
          (tx.comment && tx.comment.indexOf(keyword) > -1) ||
          tx.txid.indexOf(keyword) > -1 ||
          moment(tx.time).format('L - LTS').indexOf(keyword) > -1
         ) {
          keywordMatches += 1
        }
      })

      /** Push txs with match count equal to the number of keywords. */
      if (keywordMatches === this.search.length) {
        txs.push({
          key: tx.txid,
          amount,
          amountLocal,
          category: tx.category,
          color: tx.color,
          comment: tx.comment || '',
          time: tx.time,
          txid: tx.txid
        })
      }
    })

    /** Return transactions in ASC order. */
    return txs.reverse()
  }

  /**
   * Get data of the transaction being viewed.
   * @function viewingTx
   * @return {object|null} Transaction data or null.
   */
  @computed get viewingTx () {
    if (this.transactions.has(this.viewing) === true) {
      const saved = this.transactions.get(this.viewing)

      /** Prepare inputs. */
      const inputs = saved.vin.reduce((inputs, input) => {
        if (input.hasOwnProperty('coinbase') === false) {
          inputs.push({
            key: shortUid(),
            address: input.address,
            amount: input.value
          })
        }

        return inputs
      }, [])

      /** Prepare outputs. */
      const outputs = saved.vout.reduce((outputs, output) => {
        if (output.scriptPubKey.type !== 'nonstandard') {
          let color = ''

          /** Set color depending on output being spent. */
          if (output.hasOwnProperty('spentTxid') === true) {
            if (output.spentTxid === '') {
              color = 'green'
            } else {
              color = 'red'
            }
          }

          outputs.push({
            key: shortUid(),
            address: output.scriptPubKey.addresses[0],
            amount: output.value,
            color
          })
        }

        return outputs
      }, [])

      /** Return saved transaction data with added inputs and outputs. */
      return { ...saved, inputs, outputs }
    }

    return null
  }

  /**
   * Set addresses.
   * @function setAddresses
   * @param {array} addresses - Addresses.
   */
  @action setAddresses (addresses) {
    addresses.forEach((obj) => {
      const isSaved = this.addresses.has(obj.address)

      /** Saved: update account name incase it changed. */
      if (isSaved === true) {
        let saved = this.addresses.get(obj.address)
        saved.account = obj.account
      }

      /** Add any unsaved addresses. */
      if (isSaved === false) {
        this.addresses.set(obj.address, {
          address: obj.address,
          account: obj.account,
          balance: obj.amount
        })
      }
    })
  }

  /**
   * Set searching keywords.
   * @function setSearch
   * @param {string} keywords - Keywords to search transactions by.
   */
  @action setSearch (keywords) {
    this.search = keywords.match(/[^ ]+/g) || []
  }

  /**
   * Set transactions.
   * @function setTransactions
   * @param {array} transactions - Transactions lookups.
   * @param {array} io - Inputs and outputs lookups.
   * @param {array} options - RPC request options.
   */
  @action setTransactions (transactions, io = null, options = null) {
    let inputs = new Map()
    let outputs = new Map()

    /** Convert inputs and outputs arrays to maps for faster lookups. */
    if (io !== null) {
      io.forEach((io, index) => {
        if (io.hasOwnProperty('result') === true) {
          /** Handle gettransaction lookups. */
          if (options[index].method === 'gettransaction') {
            inputs.set(io.result.txid, io.result)
          }

          /** Handle validateaddress lookups. */
          if (options[index].method === 'validateaddress') {
            outputs.set(io.result.address, io.result)
          }
        }
      })
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
      const isSaved = this.transactions.has(tx.txid)

      /** Determine which tx to alter. */
      let save = isSaved === false
        ? tx
        : this.transactions.get(tx.txid)

      /** Update ztlock status. */
      if (tx.hasOwnProperty('ztlock') === true) {
        save.ztlock = tx.ztlock
      }

      /** Skip updating if confirmations haven't changed. */
      if (isSaved === true) {
        if (save.confirmations === tx.confirmations) return
      }

      /** Check inputs and outputs of new transactions. */
      if (isSaved === false) {
        /** Check inputs. */
        if (inputs.size > 0) {
          save.vin.forEach((vin) => {
            /** Skip coinbase inputs. */
            if (vin.hasOwnProperty('coinbase') === false) {
              if (inputs.has(vin.txid) === true) {
                const inputTx = inputs.get(vin.txid)

                /** Set the value and address of input tx.vout. */
                vin.value = inputTx.vout[vin.vout].value
                vin.address = inputTx.vout[vin.vout].scriptPubKey.addresses[0]

                /** Check if vin.txid belongs to this wallet. */
                if (this.transactions.has(vin.txid) === true) {
                  const saved = this.transactions.get(vin.txid)
                  const address = saved.vout[vin.vout].scriptPubKey.addresses[0]

                  if (outputs.has(address) === true) {
                    const output = outputs.get(address)

                    /**
                     * Check if output's address belongs to this wallet
                     * and mark it spent.
                     */
                    if (output.ismine === true) {
                      saved.vout[vin.vout].spentTxid = vin.txid
                    }
                  }
                }
              }
            }
          })
        }

        /** Check outputs. */
        if (outputs.size > 0) {
          save.vout.forEach((vout) => {
            /** Skip nonstandard outputs. */
            if (vout.scriptPubKey.type !== 'nonstandard') {
              const address = vout.scriptPubKey.addresses[0]

              if (outputs.has(address) === true) {
                const output = outputs.get(address)

                /**
                 * Check if output's address belongs to this wallet
                 * and add spentTxid property.
                 */
                if (output.ismine === true) {
                  vout.spentTxid = ''
                }
              }
            }
          })
        }
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
          if (tx.confirmations > 0) {
            save.category = 'sent'
          } else {
            save.category = 'sending'
          }
        }
      }

      /** Type: blended. */
      if (tx.hasOwnProperty('blended') === true) {
        /** TODO: Loop outputs, find your address and assign the amount. */

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
          tx.confirmations === 1 || (
            tx.confirmations === 220 &&
            tx.hasOwnProperty('generated') === true
          )
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
      if (isSaved === false) {
        this.transactions.set(save.txid, save)
      }
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
   * Set txid of the transaction being viewed.
   * @function setViewing
   * @param {string} txid - Transaction id.
   */
  @action setViewing (txid = null) {
    /** Lookup a transaction that was just sent. */
    if (
      txid !== null &&
      this.transactions.has(txid) === false
    ) {
      /** Save the txid in viewing queue. */
      this.viewingQueue = txid

      /** Re-start the loop from the last known block. */
      this.restartLoop(true)
    } else {
      this.viewing = txid

      /** Clear viewing queue if not null. */
      if (this.viewingQueue !== null) {
        this.viewingQueue = null
      }
    }
  }

  /**
   * Get addresses (including unused).
   * @function getAddresses
   */
  getAddresses () {
    rpc.exec([
      { method: 'listreceivedbyaddress', params: [0, true] }
    ], (response) => {
      if (response !== null) {
        this.setAddresses(response[0].result)
      }
    })
  }

  /**
   * Get transactions since provided block.
   * @param {string} lastBlock - Last looked up block.
   * @function getTransactions
   */
  getTransactions (lastBlock = '') {
    /**
     * 1. Get mempool and transactions since the last looked up block.
     *    If there's no response, this function will be called automatically
     *    when RPC becomes available again.
     * 2. Update lastBlock with the last looked up block's blockhash.
     * 3. Set a new timeout for this function with a 10s delay.
     * 4. Start populating next RPC options with gettransaction requests.
     * 5. Add currently viewing transaction and pending generated transactions
     *    below 220 confirmations to the options map (both if any).
     * 6. Sort transactions that were returned from listsinceblock by time ASC.
     * 7. Add transactions that were returned from listsinceblock to the
     *    options map, excluding orphaned (if any).
     * 8. Execute the RPC request with transaction lookups (if any).
     */
    rpc.exec([
      { method: 'listsinceblock', params: [lastBlock] },
      { method: 'getrawmempool', params: [true] }
    ], (response) => {
      if (response !== null) {
        let lsb = response[0].result
        let mempool = response[1].result
        let options = new Map()

        /** Last looked up block. */
        this.lastBlock = lsb.lastblock

        /** Set a new timeout for 10 seconds. */
        this.updateTimeout = setTimeout(() => {
          this.getTransactions(lsb.lastblock)
        }, 10 * 1000)

        /** Add currently viewing transaction. */
        if (this.viewing !== null) {
          options.set(this.viewing, {
            method: 'gettransaction',
            params: [this.viewing]
          })
        }

        /** Add pending generated transactions below 220 confirmations. */
        if (this.generatedPending.size > 0) {
          this.generatedPending.forEach((tx) => {
            options.set(tx.txid, {
              method: 'gettransaction',
              params: [tx.txid]
            })
          })
        }

        /** Sort transactions received from lsb by time ASC. */
        lsb.transactions.sort((a, b) => {
          if (a.time < b.time) return -1
          if (a.time > b.time) return 1
          return 0
        })

        /** Add transactions received from lsb, excluding orphaned. */
        lsb.transactions.forEach((tx) => {
          if (tx.confirmations !== -1) {
            options.set(tx.txid, {
              method: 'gettransaction',
              params: [tx.txid]
            })
          }
        })

        /**
         * 1. Convert options map to an array and execute the RPC request.
         * 2. Start populating next RPC options with gettransaction and
         *    validateaddress requests.
         * 3. Update ztlock status of transactions that exist in mempool.
         * 4. Add inputs and outputs of unsaved transactions to the options map.
         * 5. Execute the RPC request with gettransaction and validateaddress
         *    lookups (if any).
         */
        if (options.size > 0) {
          rpc.exec([...options.values()], (transactions) => {
            let options = new Map()

            transactions.forEach((tx) => {
              tx = tx.result

              /** Update ztlock status of transactions in mempool. */
              if (Array.isArray(mempool) === false) {
                if (mempool.hasOwnProperty(tx.txid) === true) {
                  tx.ztlock = mempool[tx.txid].ztlock
                }
              }

              /** Lookup inputs and outputs of unsaved transactions. */
              if (this.transactions.has(tx.txid) === false) {
                /** Lookup inputs, excluding coinbase. */
                tx.vin.forEach((input) => {
                  if (input.hasOwnProperty('coinbase') === false) {
                    options.set(input.txid, {
                      method: 'gettransaction',
                      params: [input.txid]
                    })
                  }
                })

                /** Lookup outputs, excluding nonstandard. */
                tx.vout.forEach((output) => {
                  if (output.scriptPubKey.type !== 'nonstandard') {
                    options.set(output.scriptPubKey.addresses[0], {
                      method: 'validateaddress',
                      params: [output.scriptPubKey.addresses[0]]
                    })
                  }
                })
              }
            })

            /**
             * 1. If there are no input or output lookups to be made, provide
             *    setTransactions() with transactions data.
             * 2. Convert options map to an array and execute the RPC request.
             * 3. Provide setTransactions() with transactions, io data and
             *    RPC request options to differentiate between the methods.
             */
            if (options.size === 0) {
              this.setTransactions(transactions)
            } else {
              rpc.exec([...options.values()], (io, options) => {
                if (io !== null) {
                  this.setTransactions(transactions, io, options)
                }
              })
            }
          })
        }
      }
    })
  }

  /**
   * Restart the update loop.
   * @function restart
   * @param {boolean} fromGenesis - Start from genesis or last listed block.
   * @param {boolean} getAddresses - Update addresses as well.
   */
  restart (fromGenesis = false, getAddresses = false) {
    /** Clear previous timeout id. */
    clearTimeout(this.updateTimeout)

    /** Update addresses. */
    if (getAddresses === true) {
      this.getAddresses()
    }

    /** Restart from genesis or last known block. */
    if (fromGenesis === true) {
      this.getTransactions(this.lastBlock)
    } else {
      this.getTransactions()
    }
  }
}

/** Initialize a new globally used store. */
const wallet = new Wallet()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default wallet
export { Wallet }
