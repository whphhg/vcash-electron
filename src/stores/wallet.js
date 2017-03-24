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
   * @property {array} search - Keywords to search txs by.
   * @property {string|null} viewing - Transaction being viewed.
   * @property {string|null} viewingQueue - Just sent tx waiting to be viewed.
   */
  @observable addresses = observable.map({})
  @observable transactions = observable.map({})
  @observable search = observable.array([])
  @observable viewing = null
  @observable viewingQueue = null

  /**
   * @constructor
   * @property {number|null} updateTimeout - getWallet() timeout id.
   * @property {string} lastBlock - Last looked up block.
   */
  constructor () {
    this.updateTimeout = null
    this.lastBlock = ''

    /** Get txs and addresses when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) {
        this.getWallet(true, true)
      }
    })

    /** Check if there's a sent transaction waiting to be viewed. */
    reaction(() => this.transactions.size, (size) => {
      if (this.viewingQueue !== null) {
        this.setViewing(this.viewingQueue)
      }
    })
  }

  /** TODO: @computed get accountBalances () {} */

  /**
   * Get a list of account names in alphabetical order.
   * @function accounts
   * @return {array} Account list.
   */
  @computed get accounts () {
    let accounts = new Set()

    /** Add accounts to the set. */
    this.addresses.forEach((address) => {
      if (
        address.account !== '' &&
        address.account !== null
      ) {
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
    let addresses = []

    this.addresses.forEach((data) => {
      let outputs = []
      let spent = 0

      if (data.outputs.length > 0) {
        data.outputs.forEach((output) => {
          if (output.spentTxid !== '') {
            spent += 1
          }

          outputs.push({
            ...output,
            key: shortUid(),
            color: output.spentTxid === '' ? 'green' : 'red'
          })
        })
      }

      addresses.push({
        ...data,
        outputs,
        received: outputs.length,
        spent
      })
    })

    return addresses
  }

  /**
   * Get generated transactions.
   * @function generated
   * @return {array} Generated transactions.
   */
  @computed get generated () {
    let generated = []

    this.transactions.forEach((data, txid) => {
      if (data.hasOwnProperty('generated') === true) {
        generated.push(data)
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

      /** Assign a unique key to each input. */
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

      /** Assign a unique key to each output. */
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
   * Set searching keywords.
   * @function setSearch
   * @param {string} keywords - Keywords to search transactions by.
   */
  @action setSearch (keywords) {
    this.search = keywords.match(/[^ ]+/g) || []
  }

  /**
   * Set wallet transactions and addresses.
   * @function setWallet
   * @param {array} transactions - Transactions lookups.
   * @param {array} addresses - Addresses lookup.
   * @param {array} io - Inputs and outputs lookups.
   * @param {array} options - io RPC request options.
   */
  @action setWallet (
    transactions = null,
    addresses = null,
    io = null,
    options = null
  ) {
    let inputTxs = new Map()

    /** Grouped notifications for pending and spendable txs. */
    let notifications = {
      pending: new Map(),
      spendable: new Map()
    }

    /** Set wallet label addresses. */
    if (addresses !== null) {
      addresses.forEach((address) => {
        const isSaved = this.addresses.has(address.address)

        /** Update saved addresses account names. */
        if (isSaved === true) {
          let saved = this.addresses.get(address.address)
          saved.account = address.account
        }

        /** Add unsaved addresses to the map. */
        if (isSaved === false) {
          this.addresses.set(address.address, {
            address: address.address,
            account: address.account,
            balance: 0,
            outputs: []
          })
        }
      })
    }

    /** Create a map of txs inputs and set wallet change addresses. */
    if (io !== null) {
      io.forEach((io, index) => {
        if (io.hasOwnProperty('result') === true) {
          /** Create a map of transactions inputs. */
          if (options[index].method === 'gettransaction') {
            inputTxs.set(io.result.txid, io.result)
          }

          /** Set wallet change addresses. */
          if (options[index].method === 'validateaddress') {
            if (io.result.ismine === true) {
              /** Don't override previously set change address. */
              if (this.addresses.has(io.result.address) === false) {
                this.addresses.set(io.result.address, {
                  address: io.result.address,
                  account: null,
                  balance: 0,
                  outputs: []
                })
              }
            }
          }
        }
      })
    }

    /** Go through transactions and make adjustments. */
    if (transactions !== null) {
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
          save.vin.forEach((vin) => {
            /** Skip coinbase inputs. */
            if (vin.hasOwnProperty('coinbase') === false) {
              if (inputTxs.has(vin.txid) === true) {
                const inputTx = inputTxs.get(vin.txid)

                /** Set the value and address of input tx output. */
                vin.value = inputTx.vout[vin.vout].value
                vin.address = inputTx.vout[vin.vout].scriptPubKey.addresses[0]

                if (this.transactions.has(vin.txid) === true) {
                  if (this.addresses.has(vin.address) === true) {
                    const savedTx = this.transactions.get(vin.txid)
                    const address = this.addresses.get(vin.address)

                    /** Deduct the output's amount from address balance. */
                    address.balance =
                      (
                        address.balance * 1000000 -
                        vin.value * 1000000
                      ) / 1000000

                    /** Mark the output spent in address outputs. */
                    address.outputs.forEach((output) => {
                      if (
                        output.txid === vin.txid &&
                        output.vout === vin.vout
                      ) {
                        output.spentTxid = save.txid
                      }
                    })

                    /** Mark the output spent in transaction. */
                    savedTx.vout[vin.vout].spentTxid = save.txid
                  }
                }
              }
            }
          })

          /** Check outputs. */
          save.vout.forEach((vout) => {
            /** Skip nonstandard outputs. */
            if (vout.scriptPubKey.type !== 'nonstandard') {
              let address = vout.scriptPubKey.addresses[0]

              if (this.addresses.has(address) === true) {
                address = this.addresses.get(address)

                /** Add the output's amount to address balance. */
                address.balance =
                  (
                    address.balance * 1000000 +
                    vout.value * 1000000
                  ) / 1000000

                /** Add the output to address outputs. */
                address.outputs.push({
                  txid: save.txid,
                  vout: vout.n,
                  amount: vout.value,
                  spentTxid: ''
                })

                /** Mark this output belonging to the wallet. */
                vout.spentTxid = ''
              }
            }
          })
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
              if (isSaved === false) {
                save.amount = tx.details[0].amount
              }
            }
          }

          /** Process Received and Sent to self transactions. */
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

        /** Sent. */
        if (tx.hasOwnProperty('fee') === true) {
          if (tx.amount < 0) {
            if (tx.confirmations > 0) {
              save.category = 'sent'
            } else {
              save.category = 'sending'
            }
          }
        }

        /** Blended. */
        if (tx.hasOwnProperty('blended') === true) {
          /** Count the sum of outputs belonging to this wallet. */
          if (isSaved === false) {
            save.amount = 0

            save.vout.forEach((vout) => {
              if (vout.hasOwnProperty('spentTxid') === true) {
                save.amount += vout.value
              }
            })
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
  }

  /**
   * Set txid of the transaction being viewed.
   * @function setViewing
   * @param {string} txid - Transaction id.
   */
  @action setViewing (txid = null) {
    /** Lookup transaction that was just sent. */
    if (
      txid !== null &&
      this.transactions.has(txid) === false
    ) {
      /** Save the txid in viewing queue. */
      this.viewingQueue = txid

      /** Update from the last known block. */
      this.getWallet()
    } else {
      this.viewing = txid

      /** Clear viewing queue if not null. */
      if (this.viewingQueue !== null) {
        this.viewingQueue = null
      }
    }
  }

  /**
   * Get wallet transactions and addresses.
   * @param {boolean} fromGenesis - Get txs from genesis or last block.
   * @param {boolean} addresses - Get addresses.
   * @function getWallet
   */
  getWallet (fromGenesis = false, addresses = false) {
    /** Clear previous timeout id. */
    clearTimeout(this.updateTimeout)

    /** Default RPC request options. */
    let options = [
      {
        method: 'listsinceblock',
        params: [fromGenesis === true ? '' : this.lastBlock]
      },
      {
        method: 'getrawmempool',
        params: [true]
      }
    ]

    /** Add address update RPC option if true. */
    if (addresses === true) {
      options.push({
        method: 'listreceivedbyaddress',
        params: [0, true]
      })
    }

    rpc.execute(options, (response) => {
      if (response !== null) {
        let lsb = response[0].result
        let mempool = response[1].result
        let options = new Map()

        /** Assign addresses if they were looked up. */
        const addresses = response.length === 3
          ? response[2].result
          : null

        /** Set last looked up block. */
        this.lastBlock = lsb.lastblock

        /** Set a new timeout for 10 seconds. */
        this.updateTimeout = setTimeout(() => {
          this.getWallet()
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

        /** Return addresses if there are no further lookups. */
        if (options.size === 0) {
          if (addresses !== null) {
            this.setWallet(null, addresses)
          }
        } else {
          rpc.execute([...options.values()], (transactions) => {
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
                    const address = output.scriptPubKey.addresses[0]

                    if (this.addresses.has(address) === false) {
                      options.set(address, {
                        method: 'validateaddress',
                        params: [address]
                      })
                    }
                  }
                })
              }
            })

            /** Return txs and addresses if there are no further lookups. */
            if (options.size === 0) {
              this.setWallet(transactions, addresses)
            } else {
              rpc.execute([...options.values()], (io, options) => {
                if (io !== null) {
                  this.setWallet(transactions, addresses, io, options)
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
const wallet = new Wallet()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default wallet
export { Wallet }
