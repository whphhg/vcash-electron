import { action, autorunAsync, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import { join } from 'path'
import { shortUid } from '../utilities/common'
import i18next from '../utilities/i18next'
import moment from 'moment'

export default class Wallet {
  /**
   * Observable properties.
   * @property {map} addresses - Wallet label and change addresses.
   * @property {boolean} isBlending - Blending status.
   * @property {boolean} isEncrypted - Encrypted status.
   * @property {boolean} isLocked - Locked status.
   * @property {map} responses - Saved RPC info responses.
   * @property {object} search - Addresses and txs search keywords.
   * @property {string} spendFrom - Spend funds from this account.
   * @property {map} txs - Wallet txs.
   * @property {string|null} viewing - Tx being viewed.
   * @property {string|null} viewingQueue - Just sent tx waiting to be viewed.
   */
  @observable addresses = observable.map({})
  @observable isBlending = false
  @observable isEncrypted = false
  @observable isLocked = false
  @observable responses = observable.map({})
  @observable
  search = {
    addresses: { value: '', keywords: [], timeoutId: null },
    txs: { value: '', keywords: [], timeoutId: null }
  }
  @observable spendFrom = '#'
  @observable txs = observable.map({})
  @observable viewing = null
  @observable viewingQueue = null

  /**
   * @constructor
   * @param {object} gui - GUI store.
   * @param {object} rates - Rates store.
   * @param {object} rpc - RPC store.
   * @property {string} lastBlock - Last looked up block.
   * @property {object} timeouts - Timeout ids.
   */
  constructor (gui, rates, rpc) {
    this.gui = gui
    this.rates = rates
    this.rpc = rpc
    this.lastBlock = ''
    this.timeouts = {
      getNetworkInfo: null,
      getWallet: null,
      getWalletInfo: null
    }

    /** Refresh network info every 3s until there are at least 3 peers. */
    autorunAsync(() => {
      if (
        this.peers.length < 3 ||
        this.info.getnetworkinfo.endpoints.length === 0
      ) {
        this.restart('getNetworkInfo')
      }
    }, 3 * 1000)

    /** Begin updating when RPC becomes active. */
    reaction(
      () => this.rpc.ready,
      ready => {
        /** Start update loops & update lock status. */
        if (ready === true) {
          this.restart('getNetworkInfo')
          this.restart('getWalletInfo')
          this.getWallet(true, true)
          this.getLockStatus()
        }

        /** Clear timeouts when RPC becomes inactive. */
        if (ready === false) {
          Object.keys(this.timeouts).forEach(id =>
            clearTimeout(this.timeouts[id])
          )
        }
      }
    )

    /** Restart wallet info update loop when the wallet gets unlocked. */
    reaction(
      () => this.isLocked,
      isLocked => {
        if (isLocked === false) {
          this.restart('getWalletInfo')

          /**
           * Restart network info update loop 5s after unlocking if
           * the default wallet address is not yet set.
           */
          if (this.responses.has('getincentiveinfo') === true) {
            const info = this.responses.get('getincentiveinfo')

            if (info.walletaddress === '') {
              setTimeout(() => this.restart('getNetworkInfo'), 5 * 1000)
            }
          }
        }
      }
    )

    /** Check if there's a sent transaction waiting to be viewed. */
    reaction(
      () => this.txs.size,
      size => {
        if (this.viewingQueue !== null) {
          this.setViewing(this.viewingQueue)
        }
      }
    )
  }

  /**
   * Get a list of account balances.
   * @function accountBalances
   * @return {object} Account balances.
   */
  @computed
  get accountBalances () {
    return this.addresses.values().reduce((balances, address) => {
      /** Skip change addresses. */
      if (address.account !== null) {
        const account = address.account === '' ? '*' : address.account

        if (balances.hasOwnProperty(account) === false) {
          balances[account] = parseFloat(address.balance)
        } else {
          balances[account] += parseFloat(address.balance)
        }
      }

      return balances
    }, { '#': this.info.getinfo.balance })
  }

  /**
   * Get a list of accounts in alphabetical order.
   * @function accounts
   * @return {array} Account list.
   */
  @computed
  get accounts () {
    let accounts = new Set()

    /** Add accounts to the set. */
    this.addresses.forEach(address => {
      if (address.account !== '' && address.account !== null) {
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
  @computed
  get addressList () {
    return [...this.addresses.keys()]
  }

  /**
   * Get addresses data.
   * @function addressesData
   * @return {array} Addresses data.
   */
  @computed
  get addressesData () {
    let addresses = []

    this.addresses.forEach(address => {
      let keywordMatches = 0

      if (
        this.spendFrom === '#' ||
        this.spendFrom === address.account ||
        (this.spendFrom === '*' && address.account === '')
      ) {
        const balance = new Intl.NumberFormat(this.gui.language, {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        }).format(address.balance)

        /** Increment keywordMatches by 1 each time a keyword matches. */
        this.search.addresses.keywords.forEach(keyword => {
          if (
            balance.indexOf(keyword) > -1 ||
            address.address.indexOf(keyword) > -1
          ) {
            keywordMatches += 1
          }
        })

        /** Push addresses with match count equal to the number of keywords. */
        if (keywordMatches === this.search.addresses.keywords.length) {
          let outputs = []
          let spent = 0

          if (address.outputs.length > 0) {
            address.outputs.forEach(output => {
              if (output.spentTxid !== '') spent += 1

              outputs.push({
                ...output,
                key: shortUid(),
                color: output.spentTxid === '' ? 'green' : 'red'
              })
            })
          }

          addresses.push({
            ...address,
            outputs,
            received: outputs.length,
            spent
          })
        }
      }
    })

    return addresses
  }

  /**
   * Get generated txs.
   * @function generated
   * @return {array} Generated txs.
   */
  @computed
  get generated () {
    let generated = []

    this.txs.forEach((data, txid) => {
      if (data.hasOwnProperty('generated') === true) {
        generated.push(data)
      }
    })

    /** Return generated txs in ASC order. */
    return generated.reverse()
  }

  /**
   * Get pending generated txs.
   * @function generatedPending
   * @return {map} Generated pending txs.
   */
  @computed
  get generatedPending () {
    return this.generated.reduce((pending, tx) => {
      if (tx.confirmations > 0 && tx.confirmations <= 220) {
        pending.set(tx.txid, tx)
      }

      return pending
    }, new Map())
  }

  /**
   * Get RPC info responses.
   * @function info
   * @return {object} RPC response.
   */
  @computed
  get info () {
    return this.responses.entries().reduce((responses, [key, value]) => {
      /** RPC getnetworkinfo returns null if endpoints array is empty. */
      if (key === 'getnetworkinfo' && value.endpoints === null) {
        value.endpoints = []
      }

      responses[key] = value
      return responses
    }, {
      chainblender: {
        blendstate: 'none',
        balance: 0,
        denominatedbalance: 0,
        nondenominatedbalance: 0,
        blendedbalance: 0,
        blendedpercentage: 0
      },
      getdifficulty: {
        'proof-of-work': 0,
        'proof-of-stake': 0
      },
      getmininginfo: {
        blocks: 0,
        currentblocksize: 0,
        currentblocktx: 0,
        difficulty: 0,
        errors: '',
        generate: null,
        genproclimit: 0,
        hashespersec: 0,
        networkhashps: 0,
        pooledtx: 0,
        testnet: null
      },
      getincentiveinfo: {
        walletaddress: '',
        collateralrequired: 0,
        collateralbalance: 0,
        networkstatus: '',
        votecandidate: false,
        votescore: 0
      },
      getinfo: {
        version: ':',
        protocolversion: 0,
        walletversion: 0,
        balance: 0,
        newmint: 0,
        stake: 0,
        blocks: 0,
        moneysupply: 0,
        connections: 0,
        ip: '',
        port: 0,
        difficulty: 0,
        testnet: false,
        keypoolsize: 0,
        paytxfee: 0,
        relayfee: 0
      },
      getnetworkinfo: {
        collateralized: 0,
        endpoints: [],
        tcp: { connections: 0 },
        udp: { connections: 0 }
      }
    })
  }

  /**
   * Get connected peers.
   * @function peers
   * @return {array} Saved RPC response.
   */
  @computed
  get peers () {
    if (this.responses.has('getpeerinfo') === true) {
      const peerInfo = this.responses.get('getpeerinfo')

      if (peerInfo !== null) {
        return peerInfo.reduce((peers, peer) => {
          if (peer.lastsend !== 0 && peer.startingheight !== -1) {
            peers.push({
              ...peer,
              key: shortUid(),
              version: peer.subver.match(/\/(.*)\(/).pop().split(':')[1],
              os: peer.subver.split(' ')[1].replace(')/', ''),
              ip: peer.addr.split(':')[0],
              port: peer.addr.split(':')[1]
            })
          }

          return peers
        }, [])
      }
    }

    return []
  }

  /**
   * Get pending amount.
   * @function pendingAmount
   * @return {number} Amount pending.
   */
  @computed
  get pendingAmount () {
    let pending = 0

    this.txs.forEach((tx, txid) => {
      if (
        tx.confirmations === 0 &&
        (tx.category === 'receiving' ||
          tx.category === 'sending' ||
          tx.category === 'sendingToSelf' ||
          tx.category === 'blending')
      ) {
        pending = pending + Math.abs(tx.amount)
      }
    })

    return pending
  }

  /**
   * Get blockchain sync percentage.
   * @function syncPercent
   * @return {number} Blockchain sync percentage.
   */
  @computed
  get syncPercent () {
    const peersHeight = this.peers.reduce((height, peer) => {
      if (peer.startingheight > height) return peer.startingheight
      return height
    }, this.info.getinfo.blocks)

    return this.info.getinfo.blocks / peersHeight * 100
  }

  /**
   * Get txs data.
   * @function txsData
   * @return {array} Txs data.
   */
  @computed
  get txsData () {
    let txs = []

    this.txs.forEach((tx, txid) => {
      let keywordMatches = 0

      const amount = new Intl.NumberFormat(this.gui.language, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
      }).format(tx.amount)

      const amountLocal = new Intl.NumberFormat(this.gui.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(tx.amount * this.rates.average * this.rates.local)

      /** Increment keywordMatches by 1 each time a keyword matches. */
      this.search.txs.keywords.forEach(keyword => {
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
      if (keywordMatches === this.search.txs.keywords.length) {
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

    /** Return txs in ASC order. */
    return txs.reverse()
  }

  /**
   * Get data of the transaction being viewed.
   * @function viewingTx
   * @return {object|null} Transaction data or null.
   */
  @computed
  get viewingTx () {
    if (this.txs.has(this.viewing) === true) {
      const saved = this.txs.get(this.viewing)

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
   * Set blending status.
   * @function setBlendingStatus
   */
  @action
  setBlendingStatus () {
    this.isBlending = !this.isBlending
  }

  /**
   * Set RPC info responses.
   * @function setInfo
   * @param {array} responses - RPC responses.
   * @param {array} options - RPC options.
   */
  @action
  setInfo (responses, options) {
    const overwrite = ['getnetworkinfo', 'getpeerinfo']

    responses.forEach((response, index) => {
      if (response.hasOwnProperty('result') === true) {
        /** Update previous response or set a new one. */
        if (
          this.responses.has(options[index].method) === true &&
          overwrite.includes(options[index].method) === false
        ) {
          let saved = this.responses.get(options[index].method)

          for (let i in response.result) {
            saved[i] = response.result[i]
          }
        } else {
          this.responses.set(options[index].method, response.result)
        }
      }
    })
  }

  /**
   * Set wallet lock status.
   * @function setLockStatus
   * @param {boolean} isEncrypted - Encryption status.
   * @param {boolean} isLocked - Lock status.
   */
  @action
  setLockStatus (isEncrypted, isLocked) {
    this.isEncrypted = isEncrypted
    this.isLocked = isLocked
  }

  /**
   * Set searching keywords.
   * @function setSearch
   * @param {string} key - Search object key.
   * @param {string} value - Input element value.
   */
  @action
  setSearch (key, value) {
    /** Clear previous timeout id. */
    clearTimeout(this.search[key].timeoutId)

    /** Update search string. */
    this.search[key].value = value

    /** Update keywords array in 1s, unless canceled before. */
    this.search[key].timeoutId = setTimeout(
      action('setSearch', () => {
        this.search[key].keywords = value.match(/[^ ]+/g) || []
      }),
      1 * 1000
    )
  }

  /**
   * Set the account from which the coins will be spent.
   * @function setSpendFrom
   * @param {string} account - Account name.
   */
  @action
  setSpendFrom (account = '#') {
    this.spendFrom = account
  }

  /**
   * Set wallet txs and addresses.
   * @function setWallet
   * @param {array} txs - Txs lookups.
   * @param {array} addresses - Addresses lookup.
   * @param {array} io - Inputs and outputs lookups.
   * @param {array} options - io RPC request options.
   */
  @action
  setWallet (txs = null, addresses = null, io = null, options = null) {
    let inputTxs = new Map()

    /** Grouped notifications for pending and spendable txs. */
    let notifications = { pending: new Map(), spendable: new Map() }

    /** Set wallet label addresses. */
    if (addresses !== null) {
      addresses.forEach(address => {
        if (this.addresses.has(address.address) === false) {
          this.addresses.set(address.address, {
            address: address.address,
            account: address.account,
            balance: 0,
            outputs: []
          })
        } else {
          const saved = this.addresses.get(address.address)
          saved.account = address.account
        }
      })
    }

    /** Create a map of txs inputs and set wallet change addresses. */
    if (io !== null) {
      io.forEach((io, index) => {
        if (io.hasOwnProperty('result') === true) {
          /** Create a map of txs inputs. */
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

    /** Go through txs and make adjustments. */
    if (txs !== null) {
      txs.forEach(tx => {
        tx = tx.result

        /** Get saved status. */
        const isSaved = this.txs.has(tx.txid)

        /** Determine which tx to alter. */
        let save = isSaved === false ? tx : this.txs.get(tx.txid)

        /** Update ztlock status. */
        if (tx.hasOwnProperty('ztlock') === true) {
          save.ztlock = tx.ztlock
        }

        /** Skip updating if confirmations haven't changed. */
        if (isSaved === true && save.confirmations === tx.confirmations) return

        /** Check inputs and outputs of new txs. */
        if (isSaved === false) {
          /** Check inputs. */
          save.vin.forEach(vin => {
            /** Skip coinbase inputs. */
            if (vin.hasOwnProperty('coinbase') === false) {
              if (inputTxs.has(vin.txid) === true) {
                const inputTx = inputTxs.get(vin.txid)

                /** Set the value and address of input tx output. */
                vin.value = inputTx.vout[vin.vout].value
                vin.address = inputTx.vout[vin.vout].scriptPubKey.addresses[0]

                if (this.txs.has(vin.txid) === true) {
                  if (this.addresses.has(vin.address) === true) {
                    const savedTx = this.txs.get(vin.txid)
                    const address = this.addresses.get(vin.address)

                    /** Deduct the output's amount from address balance. */
                    address.balance =
                      (address.balance * 1000000 - vin.value * 1000000) /
                      1000000

                    /** Mark the output spent in address outputs. */
                    address.outputs.forEach(output => {
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
          save.vout.forEach(vout => {
            /** Skip nonstandard outputs. */
            if (vout.scriptPubKey.type !== 'nonstandard') {
              let address = vout.scriptPubKey.addresses[0]

              if (this.addresses.has(address) === true) {
                address = this.addresses.get(address)

                /** Add the output's amount to address balance. */
                address.balance =
                  (address.balance * 1000000 + vout.value * 1000000) / 1000000

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
        save.color =
          tx.hasOwnProperty('generated') === true
            ? tx.confirmations < 220 ? 'orange' : 'green'
            : tx.confirmations === 0
              ? 'orange'
              : tx.amount > 0 ? 'green' : 'red'

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
          if (isSaved === false || save.blockhash !== tx.blockhash) {
            save.blockhash = tx.blockhash
          }
        }

        /** Process txs with details property. */
        if (tx.hasOwnProperty('details') === true) {
          /** Process PoW, PoS and Incentive reward txs. */
          if (tx.hasOwnProperty('generated') === true) {
            /** Proof-of-Stake reward. */
            if (tx.vout[0].scriptPubKey.type === 'nonstandard') {
              save.category = 'stakingReward'
            }

            if (tx.vin[0].hasOwnProperty('coinbase') === true) {
              /** Proof-of-Work reward. */
              if (
                tx.details[0].address === tx.vout[0].scriptPubKey.addresses[0]
              ) {
                save.category = 'miningReward'
              }

              /** Incentive reward. */
              if (
                tx.details[0].address === tx.vout[1].scriptPubKey.addresses[0]
              ) {
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

          /** Process Received and Sent to self txs. */
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
                tx.details.forEach(entry => {
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

            save.vout.forEach(vout => {
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
        if (tx.confirmations === 0 && tx.category !== 'sending') {
          /** Get total amount or return 0. */
          let total =
            notifications.pending.has(save.category) === true
              ? notifications.pending.get(save.category)
              : 0

          /** Add tx amount to the total. */
          notifications.pending.set(save.category, total + save.amount)
        }

        /** Add spendable amounts to notifications. */
        if (isSaved === true) {
          if (
            tx.confirmations === 1 ||
            (tx.confirmations === 220 &&
              tx.hasOwnProperty('generated') === true)
          ) {
            /** Get total amount or return 0. */
            let total =
              notifications.spendable.has(save.category) === true
                ? notifications.spendable.get(save.category)
                : 0

            /** Add tx amount to the total. */
            notifications.spendable.set(save.category, total + save.amount)
          }
        }

        /** Update confirmations. */
        save.confirmations = tx.confirmations

        /**
         * Add unsaved txs to the map,
         * saved txs update changed properties only.
         */
        if (isSaved === false) {
          this.txs.set(save.txid, save)
        }
      })

      /** Open notifications for pending txs. */
      notifications.pending.forEach((total, category) => {
        /** Convert the amount to local notation. */
        total = new Intl.NumberFormat(this.gui.language, {
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

      /** Play a incoming notification sound if enabled. */
      if (
        notifications.pending.size > 0 &&
        this.gui.soundAlerts.incoming === true
      ) {
        new Audio(
          join(__dirname, '..', 'assets', 'sounds', 'incoming.mp3')
        ).play()
      }

      /**
       * Open notification on confirmation change,
       * from 0 -> 1 and 219 -> 220 for generated.
       */
      notifications.spendable.forEach((total, category) => {
        /** Convert the amount to local notation. */
        total = new Intl.NumberFormat(this.gui.language, {
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

      /** Play a spendable notification sound if enabled. */
      if (
        notifications.spendable.size > 0 &&
        this.gui.soundAlerts.spendable === true
      ) {
        new Audio(
          join(__dirname, '..', 'assets', 'sounds', 'spendable.mp3')
        ).play()
      }
    }
  }

  /**
   * Set txid of the transaction being viewed.
   * @function setViewing
   * @param {string} txid - Transaction id.
   */
  @action
  setViewing (txid = null) {
    /** Lookup transaction that was just sent. */
    if (txid !== null && this.txs.has(txid) === false) {
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
   * Get wallet lock status.
   * @function getLockStatus
   */
  getLockStatus () {
    this.rpc.execute([{ method: 'walletpassphrase', params: [] }], response => {
      switch (response[0].error.code) {
        /** error_code_wallet_wrong_enc_state (unencrypted) */
        case -15:
          return this.setLockStatus(false, false)

        /** error_code_wallet_already_unlocked (encrypted and unlocked) */
        case -17:
          return this.setLockStatus(true, false)

        /** error_code_invalid_params (encrypted and locked) */
        case -32602:
          return this.setLockStatus(true, true)
      }
    })
  }

  /**
   * Get network info.
   * @function getNetworkInfo
   */
  getNetworkInfo () {
    this.rpc.execute(
      [
        { method: 'getnetworkinfo', params: [] },
        { method: 'getpeerinfo', params: [] },
        { method: 'getincentiveinfo', params: [] },
        { method: 'getmininginfo', params: [] },
        { method: 'getdifficulty', params: [] }
      ],
      (response, options) => {
        this.setInfo(response, options)

        /** Set a new timeout for 60 seconds. */
        this.timeouts.getNetworkInfo = setTimeout(
          () => this.getNetworkInfo(),
          60 * 1000
        )
      }
    )
  }

  /**
   * Get wallet txs and addresses.
   * @param {boolean} fromGenesis - Get txs from genesis or last block.
   * @param {boolean} addresses - Get addresses.
   * @function getWallet
   */
  getWallet (fromGenesis = false, addresses = false) {
    /** Clear previous timeout id. */
    clearTimeout(this.timeouts.getWallet)

    /** Default RPC request options. */
    let options = [
      {
        method: 'listsinceblock',
        params: [fromGenesis === true ? '' : this.lastBlock]
      },
      { method: 'getrawmempool', params: [true] }
    ]

    /** Add address update RPC option if true. */
    if (addresses === true) {
      options.push({
        method: 'listreceivedbyaddress',
        params: [0, true]
      })
    }

    this.rpc.execute(options, response => {
      let lsb = response[0].result
      let mempool = response[1].result
      let options = new Map()

      /** Assign addresses if they were looked up. */
      const addresses = response.length === 3 ? response[2].result : null

      /** Set last looked up block. */
      this.lastBlock = lsb.lastblock

      /** Set a new timeout for 10 seconds. */
      this.timeouts.getWallet = setTimeout(() => this.getWallet(), 10 * 1000)

      /** Add currently viewing transaction. */
      if (this.viewing !== null) {
        options.set(this.viewing, {
          method: 'gettransaction',
          params: [this.viewing]
        })
      }

      /** Add pending generated txs below 220 confirmations. */
      if (this.generatedPending.size > 0) {
        this.generatedPending.forEach(tx => {
          options.set(tx.txid, {
            method: 'gettransaction',
            params: [tx.txid]
          })
        })
      }

      /** Sort txs received from lsb by time ASC. */
      lsb.transactions.sort((a, b) => {
        if (a.time < b.time) return -1
        if (a.time > b.time) return 1
        return 0
      })

      /** Add txs received from lsb, excluding orphaned. */
      lsb.transactions.forEach(tx => {
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
        this.rpc.execute([...options.values()], txs => {
          let options = new Map()

          txs.forEach(tx => {
            tx = tx.result

            /** Update ztlock status of txs in mempool. */
            if (Array.isArray(mempool) === false) {
              if (mempool.hasOwnProperty(tx.txid) === true) {
                tx.ztlock = mempool[tx.txid].ztlock
              }
            }

            /** Lookup inputs and outputs of unsaved txs. */
            if (this.txs.has(tx.txid) === false) {
              /** Lookup inputs, excluding coinbase. */
              tx.vin.forEach(input => {
                if (input.hasOwnProperty('coinbase') === false) {
                  options.set(input.txid, {
                    method: 'gettransaction',
                    params: [input.txid]
                  })
                }
              })

              /** Lookup outputs, excluding nonstandard. */
              tx.vout.forEach(output => {
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
            this.setWallet(txs, addresses)
          } else {
            this.rpc.execute([...options.values()], (io, options) => {
              this.setWallet(txs, addresses, io, options)
            })
          }
        })
      }
    })
  }

  /**
   * Get wallet info.
   * @function getWalletInfo
   */
  getWalletInfo () {
    this.rpc.execute(
      [
        { method: 'getinfo', params: [] },
        { method: 'chainblender', params: ['info'] }
      ],
      (response, options) => {
        this.setInfo(response, options)

        /** Set a new timeout for 10 seconds. */
        this.timeouts.getWalletInfo = setTimeout(
          () => this.getWalletInfo(),
          10 * 1000
        )
      }
    )
  }

  /**
   * Clear previous timeout id and restart the provided update loop.
   * @function restart
   * @param {string} timeout - Timeout key.
   */
  restart (timeout) {
    clearTimeout(this.timeouts[timeout])
    this[timeout]()
  }
}
