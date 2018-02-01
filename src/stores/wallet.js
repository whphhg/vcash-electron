import { action, computed, extendObservable, reaction, runInAction } from 'mobx'
import { notification } from 'antd'
import { shortUid } from '../utilities/common.js'
import { coin } from '../utilities/constants.js'
import i18next from '../utilities/i18next.js'

class Wallet {
  /**
   * @param {object} gui - Global GUI store.
   * @param {object} rates - Global Rates store.
   * @param {object} rpc - Connection instance RPC store.
   * @prop {string} lastBlock - Last block looked up for new transactions.
   * @prop {number} lastUpdate - Time (in ms) of last wallet update.
   * @prop {object} timeouts - Update loops timeouts.
   * @prop {map} acc - Accounts assigned to addresses.
   * @prop {map} addr - Label and change addresses.
   * @prop {object} info - Info presets responses.
   * @prop {boolean} isBlending - Blending status.
   * @prop {boolean} isEncrypted - Wallet.dat encryption status.
   * @prop {boolean} isLocked - Lock status.
   * @prop {map} tx - Transactions since genesis block.
   * @prop {array} utxo - Unspent transaction outputs.
   * @prop {object} viewing - Address and transaction being viewed.
   */
  constructor(gui, rates, rpc) {
    this.gui = gui
    this.rates = rates
    this.rpc = rpc
    this.lastBlock = ''
    this.lastUpdate = 0
    this.timeouts = { network: null, transactions: null, wallet: null }

    /** Extend the store with observable properties. */
    extendObservable(this, {
      acc: new Map(),
      addr: new Map(),
      info: {
        /** ChainBlender */
        blendstate: 'none',
        balanceOnChain: 0,
        denominatedbalance: 0,
        nondenominatedbalance: 0,
        blendedbalance: 0,
        blendedpercentage: 0,
        /** GetDifficulty */
        'proof-of-work': 0,
        'proof-of-stake': 0,
        'search-interval': 0,
        /** GetMiningInfo */
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
        testnet: null,
        /** GetIncentiveInfo */
        walletaddress: '',
        collateralrequired: 0,
        collateralbalance: 0,
        networkstatus: '',
        votecandidate: false,
        votescore: 0,
        /** GetInfo */
        version: ':',
        protocolversion: 0,
        walletversion: 0,
        balance: 0,
        newmint: 0,
        stake: 0,
        moneysupply: 0,
        connections: 0,
        ip: '',
        port: 0,
        keypoolsize: 0,
        paytxfee: 0,
        relayfee: 0,
        /** GetNetworkInfo */
        udp: { connections: 0, ip: '', port: 0 },
        endpoints: [],
        tcp: { connections: 0, ip: '', port: 0 },
        collateralized: 0,
        /** GetPeerInfo */
        peers: [],
        /** GetUnconfirmedBalance */
        unconfirmed: 0
      },
      isBlending: false,
      isEncrypted: false,
      isLocked: false,
      tx: new Map(),
      utxo: [],
      viewing: { addr: '', tx: '' }
    })

    /** Start update loops or cleanup after RPC connectivity change. */
    reaction(
      () => this.rpc.ready,
      ready => {
        if (ready === true) {
          this.updateInfo('network')
          this.updateInfo('wallet')
          this.updateAddresses()
          this.updateLockStatus()
        }

        if (ready === false) {
          /** Clear auto-update timeouts when RPC becomes unreachable. */
          Object.keys(this.timeouts).forEach(id =>
            clearTimeout(this.timeouts[id])
          )
        }
      },
      { name: 'Wallet: RPC ready changed, adjusting update loops.' }
    )

    /** Restart wallet info update loop when the wallet gets unlocked. */
    reaction(
      () => this.isLocked,
      isLocked => {
        if (isLocked === false) {
          this.updateInfo('wallet')

          /** Update default wallet address 5s after unlocking if not set. */
          if (this.info.walletaddress === '') {
            setTimeout(() => this.updateInfo('network'), 5 * 1000)
          }
        }
      },
      { name: 'Wallet: lock status changed, checking if default address set.' }
    )

    /** Refresh network info every 3s until there are at least 3 peers. */
    reaction(
      () => [this.info.peers, this.info.endpoints],
      ([peers, endpoints]) => {
        if (peers.length < 3 || endpoints.length === 0) {
          this.updateInfo('network')
        }
      },
      { delay: 3 * 1000, name: 'Wallet: checking if connected to >= 3 peers.' }
    )

    /** Update wallet on balance or unconfirmed balance change. */
    reaction(
      () => [this.info.balance, this.info.unconfirmed],
      ([balance, unconfirmed]) => this.updateWallet(false, true),
      { name: 'Wallet: balance changed. Updating transactions and addressses.' }
    )

    /** Update wallet on block change if there are pending generated tx. */
    reaction(
      () => this.info.blocks,
      blocks => {
        if (this.generatedPending.length > 0) this.updateWallet()
      },
      { name: 'Wallet: block changed, updating if pending generated tx > 0.' }
    )
  }

  /**
   * Get a list of accounts.
   * @function accKeys
   * @return {array} Account list.
   */
  @computed
  get accKeys() {
    return [...this.acc.keys()]
  }

  /**
   * Get account names (excluding default "") in alphabetical order.
   * @function accNames
   * @return {array} Sorted account names.
   */
  @computed
  get accNames() {
    return this.accKeys.filter(key => key !== '').sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return -1
      if (a.toLowerCase() > b.toLowerCase()) return 1
      return 0
    })
  }

  /**
   * Get a list of label and change addresses.
   * @function addrKeys
   * @return {array} Address list.
   */
  @computed
  get addrKeys() {
    return [...this.addr.keys()]
  }

  /**
   * Get generated transactions since genesis block.
   * @function generated
   * @return {array} Generated transaction IDs.
   */
  @computed
  get generated() {
    let generated = []

    this.tx.forEach((tx, txid) => {
      if ('generated' in tx === true) generated.push(txid)
    })

    /** Return generated transactions in DESC order. */
    return generated.reverse()
  }

  /**
   * Get pending generated transactions.
   * @function generatedPending
   * @return {array} Pending generated transaction IDs.
   */
  @computed
  get generatedPending() {
    let pending = []

    /** Return empty array if there are no generated transactions. */
    if (this.generated.length === 0) return pending

    for (let i = 0; i < this.generated.length; i++) {
      const tx = this.tx.get(this.generated[i])

      /** Break loop after transactions reach confirmation threshold of 220. */
      if (tx.confirmations > 220) break

      /** Add pending generated transaction ID. */
      pending.push(tx.txid)
    }

    return pending
  }

  /**
   * Get connected peers info.
   * @function peers
   * @return {array} Connected peers.
   */
  @computed
  get peers() {
    return this.info.peers.reduce((peers, peer) => {
      if (peer.lastsend !== 0 && peer.startingheight !== -1) {
        peers.push({
          ...peer,
          key: shortUid(),
          conntime: peer.conntime * 1000,
          ip: peer.addr.split(':')[0],
          lastrecv: peer.lastrecv * 1000,
          port: peer.addr.split(':')[1],
          os: peer.subver.split(' ')[1].replace(')/', ''),
          version: peer.subver
            .match(/\/(.*)\(/)
            .pop()
            .split(':')[1]
        })
      }

      return peers
    }, [])
  }

  /**
   * Get total pending balance.
   * @function pending
   * @return {number} Total pending balance.
   */
  @computed
  get pending() {
    const { newmint, stake, unconfirmed } = this.info
    return (newmint * coin + stake * coin + unconfirmed * coin) / coin
  }

  /**
   * Get the locally best block chain sync percentage related to peers height.
   * @function syncPercent
   * @return {number} Sync percentage.
   */
  @computed
  get syncPercent() {
    const peersHeight = this.peers.reduce((height, peer) => {
      if (peer.startingheight > height) return peer.startingheight
      return height
    }, this.info.blocks)

    return this.info.blocks / peersHeight * 100
  }

  /**
   * Transaction IDs since genesis block.
   * @function txKeys
   * @return {array} Transaction IDs.
   */
  @computed
  get txKeys() {
    return [...this.tx.keys()].reverse()
  }

  /**
   * Unspent transaction outputs in txid:n format.
   * @function utxoKeys
   * @return {array} Unspent transaction outputs.
   */
  @computed
  get utxoKeys() {
    return this.utxo.reduce((utxo, output) => {
      utxo.push(output.txid + ':' + output.vout)
      return utxo
    }, [])
  }

  /**
   * Set viewing transaction or address.
   * @function setViewing
   * @param {string} key - Type of value (addr / tx).
   * @param {string} value - Transaction ID or address.
   */
  @action
  setViewing(key, value) {
    this.viewing[key] = value
  }

  /**
   * Set transactions and change addresses.
   * @function setWallet
   * @param {object} tx - Transactions to parse and update.
   * @param {object} mem - Current mempool.
   * @param {object} io - Input transactions and output addresses lookups.
   */
  @action
  setWallet(tx, mem, io = null) {
    const isMemPoolEmpty = Array.isArray(mem.result) === true

    /** Map of input transactions lookup results. */
    let inputTx = new Map()

    /** Grouped notifications for incoming and spendable transactions. */
    let notifications = { incoming: new Map(), spendable: new Map() }

    /** Update notification amounts. */
    const updateNotifications = (type, category, amount) => {
      const totalExists = notifications[type].has(category) === true
      const total = totalExists === true ? notifications[type].get(category) : 0

      notifications[type].set(category, (total * coin + amount * coin) / coin)
    }

    /** Show notifications and play the sounds. */
    const showNotifications = type => {
      const msg = type === 'incoming' ? 'toBeConfirmed' : 'hasBeenConfirmed'
      const icon = type === 'incoming' ? 'info' : 'success'

      notifications[type].forEach((total, category) => {
        /** Convert the total amount to local notation. */
        total = new Intl.NumberFormat(this.gui.language, {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        }).format(total)

        /** Open the notification. */
        notification[icon]({
          message: i18next.t(category),
          description: total + ' XVC ' + i18next.t(msg)
        })
      })

      /** Play a notification sound if enabled. */
      if (notifications[type].size > 0 && this.gui.soundAlerts[type] === true) {
        this.gui.sounds[type].play()
      }
    }

    if (io !== null) {
      io.res.forEach((res, index) => {
        if ('result' in res === false) return

        /** Populate the map of input transactions lookup results. */
        if (io.req[index].method === 'gettransaction') {
          inputTx.set(res.result.txid, res.result)
        }

        /** Add change addresses. */
        if (
          io.req[index].method === 'validateaddress' &&
          res.result.ismine === true &&
          this.addr.has(res.result.address) === false
        ) {
          this.addr.set(res.result.address, {
            account: null,
            address: res.result.address,
            balance: 0,
            outputs: [],
            received: 0,
            spent: 0
          })
        }
      })
    }

    /** Set or update transactions. */
    tx.res.forEach(tx => {
      tx = tx.result

      /** Get transaction saved status. */
      const isSaved = this.tx.has(tx.txid)

      /** Determine which transaction to alter (saved or result). */
      let save = isSaved === false ? tx : this.tx.get(tx.txid)

      /** Update ztlock status if transaction is in mempool. */
      if (isMemPoolEmpty === false && tx.txid in mem.result === true) {
        save.ztlock = mem.result[tx.txid].ztlock
      }

      /** Skip updating if confirmations haven't changed. */
      if (isSaved === true && save.confirmations === tx.confirmations) return

      /** Set inputs and outputs of new and orphaned transactions. */
      if (isSaved === false || tx.confirmations === -1) {
        /** Set inputs. */
        save.vin.forEach(vin => {
          if ('coinbase' in vin === true) return
          if (inputTx.has(vin.txid) === false) return

          /** Get the input transaction. */
          const input = inputTx.get(vin.txid)

          /** Set the value and address of input transaction output. */
          vin.value = input.vout[vin.vout].value
          vin.address = input.vout[vin.vout].scriptPubKey.addresses[0]

          /** Mark the output spent below. */
          if (this.tx.has(vin.txid) === false) return
          if (this.addr.has(vin.address) === false) return

          const savedTx = this.tx.get(vin.txid)
          const addr = this.addr.get(vin.address)

          /** Mark the output spent / spendable in address outputs. */
          addr.outputs.forEach(output => {
            if (output.txid === vin.txid && output.vout === vin.vout) {
              output.spentTxid = tx.confirmations === -1 ? '' : save.txid
            }
          })

          /** Revert changes if transaction becomes orphaned. */
          if (tx.confirmations === -1) {
            /** Add the output amount to address balance. */
            addr.balance = (addr.balance * coin + vin.value * coin) / coin

            /** Decrease the spent count. */
            addr.spent -= 1

            /** Mark the output spendable in transaction. */
            savedTx.vout[vin.vout].spentTxid = ''
          } else {
            /** Deduct the output amount from address balance. */
            addr.balance = (addr.balance * coin - vin.value * coin) / coin

            /** Increase the spent count. */
            addr.spent += 1

            /** Mark the output spent in transaction. */
            savedTx.vout[vin.vout].spentTxid = save.txid
          }
        })

        /** Set outputs. */
        save.vout.forEach(vout => {
          if (vout.scriptPubKey.type === 'nonstandard') return
          if (this.addr.has(vout.scriptPubKey.addresses[0]) === false) return

          const addr = this.addr.get(vout.scriptPubKey.addresses[0])

          /** Revert changes if transaction becomes orphaned. */
          if (tx.confirmations === -1) {
            /** Deduct the output amount from address balance. */
            addr.balance = (addr.balance * coin - vout.value * coin) / coin

            /** Remove the output from address outputs. */
            addr.outputs.forEach((output, index) => {
              if (output.txid === save.txid && output.vout === vout.n) {
                addr.outputs.splice(index, 1)
              }
            })

            /** Decrease the received count. */
            addr.received -= 1
          } else {
            /** Add the output amount to address balance. */
            addr.balance = (addr.balance * coin + vout.value * coin) / coin

            /** Add the output to address outputs. */
            addr.outputs.push({
              txid: save.txid,
              vout: vout.n,
              scriptPubKey: vout.scriptPubKey.hex,
              amount: vout.value,
              spentTxid: ''
            })

            /** Increase the received count. */
            addr.received += 1
          }

          /** Mark this output belonging to the wallet. */
          vout.spentTxid = ''
        })
      }

      /** Remove orphaned tx after vin and vout have been reset above. */
      if (tx.confirmations === -1) this.tx.delete(tx.txid)

      /** Set amount color. */
      save.color =
        'generated' in tx === true
          ? tx.confirmations < 220 ? 'orange' : 'green'
          : tx.confirmations === 0 ? 'orange' : tx.amount > 0 ? 'green' : 'red'

      /** Convert time to miliseconds. */
      if ('time' in tx === true) {
        save.time = tx.time * 1000
      }

      /** Convert blocktime to miliseconds. */
      if ('blocktime' in tx === true) {
        save.blocktime = tx.blocktime * 1000
      }

      /** Convert timereceived to miliseconds. */
      if ('timereceived' in tx === true) {
        save.timereceived = tx.timereceived * 1000
      }

      /** Set blockhash if found in block. */
      if ('blockhash' in tx === true) {
        save.blockhash = tx.blockhash
      }

      /** Process transactions with details property. */
      if ('details' in tx === true) {
        /** Process generated transactions. */
        if ('generated' in tx === true) {
          /** Proof-of-Stake reward. */
          if (tx.vout[0].scriptPubKey.type === 'nonstandard') {
            save.category = 'stakingReward'
          }

          if ('coinbase' in tx.vin[0] === true) {
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
           *  - PoS: tx.amount is negative, sum of vout amounts - stake reward.
           *  - Incentive: tx.amount is zero.
           *
           * During this time use the correct amount from tx.details.
           */
          if (isSaved === false && tx.confirmations < 220) {
            save.amount = tx.details[0].amount
          }
        }

        /** Process Received and Sent to self transactions. */
        if ('generated' in tx === false) {
          /** Received. */
          if (tx.amount !== 0) {
            save.category = tx.confirmations > 0 ? 'received' : 'receiving'
          }

          /** Sent to self. */
          if (tx.amount === 0) {
            save.category = tx.confirmations > 0 ? 'sentSelf' : 'sendingSelf'

            /** Calculate the sum of amounts in details. */
            if (isSaved === false) {
              tx.details.forEach(entry => {
                save.amount = (save.amount * coin + entry.amount * coin) / coin
              })
            }
          }
        }
      }

      /** Sent. */
      if ('fee' in tx === true) {
        if (tx.amount < 0) {
          save.category = tx.confirmations > 0 ? 'sent' : 'sending'
        }
      }

      /** Blended. */
      if ('blended' in tx === true) {
        save.category = tx.confirmations > 0 ? 'blended' : 'blending'

        /** Count the sum of outputs belonging to this wallet. */
        if (isSaved === false) {
          save.amount = save.vout.reduce((amount, vout) => {
            if ('spentTxid' in vout === false) return amount
            return (amount * coin + vout.value * coin) / coin
          }, 0)
        }
      }

      /** Add incoming amounts to notifications. */
      if (tx.confirmations === 0 && tx.category !== 'sending') {
        updateNotifications('incoming', save.category, save.amount)
      }

      /** Add spendable amounts to notifications. */
      if (
        (isSaved === true || tx.blockhash === '0'.repeat(64)) &&
        (tx.confirmations === 1 ||
          (tx.confirmations === 220 && 'generated' in tx === true))
      ) {
        updateNotifications('spendable', save.category, save.amount)
      }

      /** Update confirmations. */
      save.confirmations = tx.confirmations

      /** Set new transaction. */
      if (isSaved === false) this.tx.set(save.txid, save)
    })

    /** Show notifications if there are incoming or spendable transactions. */
    showNotifications('incoming')
    showNotifications('spendable')

    /** Set the address and transaction being viewed on startup. */
    if (this.viewing.addr === '') this.setViewing('addr', this.addrKeys[0])
    if (this.viewing.tx === '') this.setViewing('tx', this.txKeys[0])
  }

  /**
   * Toggle blending status.
   * @function toggleBlendingStatus
   */
  @action
  toggleBlendingStatus() {
    this.isBlending = !this.isBlending
  }

  /**
   * Update label addresses and account balances.
   * @function updateAddresses
   * @param {array} accounts - Accounts to update the addresses of.
   */
  @action
  async updateAddresses(accounts = null) {
    let resAcc = await this.rpc.listAccounts()
    if ('result' in resAcc === false) return

    /** TODO: Remove once issue #47 in openvcash/vcash is resolved. */
    if (Array.isArray(resAcc.result) === true) {
      resAcc.result = { '': resAcc.result[0] }
    }

    /** Update addresses and balances of every account by default. */
    if (accounts === null) {
      accounts = Object.keys(resAcc.result)
    }

    /** Get addresses of each account. */
    const resAddr = await this.rpc.batch(
      accounts.reduce((req, acc) => {
        req.push({ method: 'getaddressesbyaccount', params: [acc] })
        return req
      }, [])
    )

    /** Exit if there are no results in response. */
    if ('res' in resAddr === false) return

    runInAction(() => {
      /** Add new account or update existing. */
      accounts.forEach((acc, index) => {
        if (this.acc.has(acc) === false) {
          this.acc.set(acc, {
            balance: resAcc.result[acc],
            addresses: resAddr.res[index].result
          })
        } else {
          const saved = this.acc.get(acc)
          saved.balance = resAcc.result[acc]
          saved.addresses = resAddr.res[index].result
        }
      })

      /** Add new label address or update existing. */
      resAddr.res.forEach((addresses, index) => {
        addresses.result.forEach(address => {
          if (this.addr.has(address) === false) {
            this.addr.set(address, {
              account: resAddr.req[index].params[0],
              address,
              balance: 0,
              outputs: [],
              received: 0,
              spent: 0
            })
          } else {
            /** Update account name in case it's different due to re-import. */
            const saved = this.addr.get(address)
            saved.account = resAddr.req[index].params[0]
          }
        })
      })
    })
  }

  /**
   * Update info props present in the specified preset of RPC requests.
   * @function updateInfo
   * @param {string} preset - Network or wallet.
   */
  @action
  async updateInfo(preset = 'wallet') {
    const presets = {
      network: {
        requests: [
          { method: 'getnetworkinfo', params: [] },
          { method: 'getpeerinfo', params: [] },
          { method: 'getincentiveinfo', params: [] },
          { method: 'getmininginfo', params: [] },
          { method: 'getdifficulty', params: [] }
        ],
        update: 60 * 1000
      },
      wallet: {
        requests: [
          { method: 'getinfo', params: [] },
          { method: 'getunconfirmedbalance', params: [] },
          { method: 'chainblender', params: ['info'] }
        ],
        update: 10 * 1000
      }
    }

    /** Clear previously set timeout. */
    clearTimeout(this.timeouts[preset])

    /** Get the RPC responses. */
    const batch = await this.rpc.batch(presets[preset].requests)

    /** Start a new timeout for the specified preset while RPC is ready. */
    if (this.rpc.ready === true) {
      this.timeouts[preset] = setTimeout(
        () => this.updateInfo(preset),
        presets[preset].update
      )
    }

    if ('res' in batch === true) {
      /** These RPCs return keyless values. Assign them manually below. */
      const assignTo = {
        getpeerinfo: 'peers',
        getunconfirmedbalance: 'unconfirmed'
      }

      runInAction(() => {
        batch.res.forEach((res, index) => {
          if ('result' in res === false) return

          /** Set the results of RPC methods in assignTo to assigned props. */
          if (batch.req[index].method in assignTo === true) {
            this.info[assignTo[batch.req[index].method]] = res.result
          } else {
            for (let prop in res.result) {
              /** Update nested objects (e.g. getnetworkinfo tcp and udp). */
              if (
                typeof res.result[prop] === 'object' &&
                Array.isArray(res.result[prop]) === false
              ) {
                for (let nested in res.result[prop]) {
                  this.info[prop][nested] = res.result[prop][nested]
                }
              } else {
                /** ChainBlender info returns balance on chain, re-assign it. */
                if (
                  batch.req[index].method === 'chainblender' &&
                  prop === 'balance'
                ) {
                  this.info.balanceOnChain = res.result[prop]
                } else {
                  this.info[prop] = res.result[prop]
                }
              }
            }
          }
        })
      })
    }
  }

  /**
   * Update wallet lock status.
   * @function updateLockStatus
   */
  @action
  async updateLockStatus() {
    const res = await this.rpc.walletPassphrase()
    if ('error' in res === false) return

    const is = (() => {
      switch (res.error.code) {
        case -32602:
          return { encrypted: true, locked: true }
        case -17:
          return { encrypted: true, locked: false }
        case -15:
          return { encrypted: false, locked: false }
      }
    })()

    runInAction(() => {
      this.isEncrypted = is.encrypted
      this.isLocked = is.locked
    })
  }

  /**
   * Update unspent transaction outputs.
   * @function updateUtxo
   */
  async updateUtxo() {
    const res = await this.rpc.listUnspent()
    if ('result' in res === false) return

    runInAction(() => {
      this.utxo = res.result
    })
  }

  /**
   * Update transactions and change addresses.
   * @param {boolean} fromGenesis - Since genesis or last looked up block.
   * @param {boolean} force - Disregard the 5 second update limit.
   * @function updateWallet
   */
  async updateWallet(fromGenesis = false, force = false) {
    /** Clear previous update timeout. */
    clearTimeout(this.timeouts.transactions)

    /** Enforce the 5 second update limit, unless forced to update. */
    if (this.lastUpdate !== 0 && force === false) {
      if (Date.now() - this.lastUpdate < 5 * 1000) {
        /** Set a timeout for the remaining difference. */
        this.timeouts.transactions = setTimeout(() => {
          this.updateWallet()
        }, 5 * 1000 - (Date.now() - this.lastUpdate))

        return
      }
    }

    /** Set time in ms when the update ran. */
    this.lastUpdate = Date.now()

    /** Get transactions info since genesis block or last looked up block. */
    const sinceBlock = fromGenesis === true ? '' : this.lastBlock
    const resLsb = await this.rpc.listSinceBlock(sinceBlock)
    if ('result' in resLsb === false) return

    /** Set the last looked up block. */
    this.lastBlock = resLsb.result.lastblock

    /** Sort transactions received from lsb by time ASC. */
    resLsb.result.transactions.sort((a, b) => {
      if (a.time < b.time) return -1
      if (a.time > b.time) return 1
      return 0
    })

    /** Prepare a map of RPC requests for transactions returned by lsb. */
    let lookupTx = resLsb.result.transactions.reduce((lookupTx, tx) => {
      /** Skip all unsaved orphaned transactions. */
      if (this.tx.has(tx.txid) === false && tx.confirmations === -1) {
        return lookupTx
      }

      lookupTx.set(tx.txid, { method: 'gettransaction', params: [tx.txid] })
      return lookupTx
    }, new Map())

    /** Add currently viewing transaction. */
    if (this.viewing.tx !== '') {
      lookupTx.set(this.viewing.tx, {
        method: 'gettransaction',
        params: [this.viewing.tx]
      })
    }

    /** Add pending generated transactions with less than 220 confirmations. */
    this.generatedPending.forEach(tx => {
      lookupTx.set(tx, { method: 'gettransaction', params: [tx] })
    })

    /** Exit if there are no transactions to lookup. */
    if (lookupTx.size === 0) return

    /** Get transactions. */
    const resTx = await this.rpc.batch([...lookupTx.values()])
    if ('res' in resTx === false) return

    /** Get mempool. */
    const resMem = await this.rpc.getRawMemPool(true)
    if ('result' in resMem === false) return

    /** Update unspent transaction outputs. */
    this.updateUtxo()

    /** Prepare a map of inputs and outputs to lookup further. */
    let lookupIo = resTx.res.reduce((lookupIo, tx) => {
      if ('result' in tx === false) return lookupIo

      /** Lookup unsaved and saved orphaned (after confirm.) transactions. */
      if (
        this.tx.has(tx.result.txid) === false ||
        tx.result.confirmations === -1
      ) {
        /** Get input transactions, excluding coinbase. */
        tx.result.vin.forEach(input => {
          if ('coinbase' in input === true) return

          lookupIo.set(input.txid, {
            method: 'gettransaction',
            params: [input.txid]
          })
        })

        /** Validate unknown output addresses, excluding nonstandard. */
        tx.result.vout.forEach(output => {
          if (output.scriptPubKey.type === 'nonstandard') return
          if (this.addr.has(output.scriptPubKey.addresses[0]) === true) return

          lookupIo.set(output.scriptPubKey.addresses[0], {
            method: 'validateaddress',
            params: [output.scriptPubKey.addresses[0]]
          })
        })
      }

      return lookupIo
    }, new Map())

    /** Exit and set transactions if there are no input and output lookups. */
    if (lookupIo.size === 0) return this.setWallet(resTx, resMem)

    /** Get input transactions and output addresses. */
    const resIo = await this.rpc.batch([...lookupIo.values()])
    if ('res' in resIo === false) return

    /** Set transactions (with vin & vout) and change addresses. */
    this.setWallet(resTx, resMem, resIo)
  }
}

/** Export store class as default export. */
export default Wallet
