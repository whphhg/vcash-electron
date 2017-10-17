import { action, computed, extendObservable, reaction, runInAction } from 'mobx'
import { shortUid } from '../utilities/common'

class WalletNext {
  constructor(gui, rates, rpc) {
    this.gui = gui
    this.rates = rates
    this.rpc = rpc

    /** Batch info request presets. */
    this.infoPresets = {
      network: {
        requests: [
          { method: 'getnetworkinfo', params: [] },
          { method: 'getpeerinfo', params: [] },
          { method: 'getincentiveinfo', params: [] },
          { method: 'getmininginfo', params: [] },
          { method: 'getdifficulty', params: [] }
        ],
        update: 60 * 1000,
        timeout: null
      },
      wallet: {
        requests: [
          { method: 'getinfo', params: [] },
          { method: 'getunconfirmedbalance', params: [] },
          { method: 'chainblender', params: ['info'] }
        ],
        update: 10 * 1000,
        timeout: null
      }
    }

    /** Extend the store with observable properties. */
    extendObservable(this, {
      acc: new Map(),
      addr: new Map(),
      info: {
        /** ChainBlender */
        blendstate: 'none',
        balance: 0,
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
      utxo: []
    })

    /** Start update loops or cleanup after RPC connectivity change. */
    reaction(
      () => this.rpc.ready,
      ready => {
        if (ready === true) {
          this.updateLockStatus()
          this.updateAddresses()
          this.updateUTXO()

          /** Start this.info update loop presets. */
          Object.keys(this.infoPresets).forEach(preset =>
            this.updateInfo(preset)
          )
        }

        if (ready === false) {
          /** Clear this.info update loop presets timeouts. */
          Object.keys(this.infoPresets).forEach(preset =>
            clearTimeout(this.infoPresets[preset].timeout)
          )
        }
      },
      { name: 'Wallet: RPC connectivity changed.' }
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
      { name: 'Wallet: lock status changed.' }
    )
  }

  /**
   * Get account names (excluding default "") in alphabetical order.
   * @function accountNames
   * @return {array} Account names.
   */
  @computed
  get accountNames() {
    return this.acc
      .keys()
      .filter(key => key !== '')
      .sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) return -1
        if (a.toLowerCase() > b.toLowerCase()) return 1
        return 0
      })
  }

  /**
   * Get accounts with utxo balances and associated addresses.
   * @function accounts
   * @return {object} Accounts data.
   */
  @computed
  get accounts() {
    return this.acc.entries().reduce((accounts, [key, values]) => {
      accounts[key] = {
        ...values,
        balanceUTXO: this.utxoBalances.acc[key] || 0
      }

      return accounts
    },
    { '#': { balance: this.info.balance } })
  }

  /**
   * Get a list of label and change addresses.
   * @function addressList
   * @return {array} Address list.
   */
  @computed
  get addressList() {
    return [...this.addr.keys()]
  }

  /**
   * Get addresses data (account, balance, outputs, received and spent counts).
   * @function addresses
   * @return {array} Addresses data.
   */
  @computed
  get addresses() {
    return this.addr.entries().reduce((addresses, [key, values]) => {
      let outputs = []
      let spent = 0

      /** Count spent outputs. */
      if (values.outputs.length > 0) {
        values.outputs.forEach(output => {
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
        ...values,
        balance: this.utxoBalances.addr[key] || 0,
        outputs,
        received: outputs.length,
        spent
      })

      return addresses
    }, [])
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
          version: peer.subver
            .match(/\/(.*)\(/)
            .pop()
            .split(':')[1],
          os: peer.subver.split(' ')[1].replace(')/', ''),
          ip: peer.addr.split(':')[0],
          port: peer.addr.split(':')[1]
        })
      }

      return peers
    }, [])
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
   * Get unspent tx outputs balances grouped by accounts and addresses.
   * @function utxoBalances
   * @return {object} UTXO balances.
   */
  @computed
  get utxoBalances() {
    return this.utxo.reduce(
      (balances, utxo) => {
        /** Update account's balance. */
        if ('account' in utxo === true) {
          if (utxo.account in balances.acc === true) {
            balances.acc[utxo.account] =
              (balances.acc[utxo.account] * 1000000 + utxo.amount * 1000000) /
              1000000
          } else {
            balances.acc[utxo.account] = utxo.amount
          }
        }

        /** Update address's balance. */
        if (utxo.address in balances.addr === true) {
          balances.addr[utxo.address] =
            (balances.addr[utxo.address] * 1000000 + utxo.amount * 1000000) /
            1000000
        } else {
          balances.addr[utxo.address] = utxo.amount
        }

        return balances
      },
      { acc: {}, addr: {} }
    )
  }

  /**
   * Set blending status.
   * @function setBlendingStatus
   */
  @action
  setBlendingStatus() {
    this.isBlending = !this.isBlending
  }

  /**
   * Update label addresses and accounts balances.
   * @function updateAddresses
   * @param {array} accounts - Accounts to update the addresses of.
   */
  @action
  async updateAddresses(accounts = null) {
    const resAcc = await this.rpc.listAccounts()

    /** Exit if there's no result in response. */
    if ('result' in resAcc === false) return

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
      accounts.forEach((acc, index) => {
        if (this.acc.has(acc) === false) {
          /** Add new account. */
          this.acc.set(acc, {
            balance: resAcc.result[acc],
            addresses: resAddr.res[index].result
          })
        } else {
          const saved = this.acc.get(acc)

          /** Update balance and addresses. */
          saved.balance = resAcc.result[acc]
          saved.addresses = resAddr.res[index].result
        }
      })

      resAddr.res.forEach((addresses, index) => {
        addresses.result.forEach(address => {
          if (this.addr.has(address) === false) {
            /** Add a new label address. */
            this.addr.set(address, {
              address,
              account: resAddr.req[index].params[0],
              outputs: []
            })
          } else {
            const saved = this.addr.get(address)

            /** Update account names in case they differ due to re-import. */
            saved.account = resAddr.req[index].params[0]
          }
        })
      })
    })
  }

  /**
   * Update info props present in the specified preset of RPC requests.
   * @function updateInfo
   * @param {string} preset - network or wallet.
   */
  @action
  async updateInfo(preset = 'wallet') {
    clearTimeout(this.infoPresets[preset].timeout)

    /** Get the RPC responses. */
    const batch = await this.rpc.batch(this.infoPresets[preset].requests)

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
              /** Update nested objects (e.g. getnetworkinfo's tcp and udp). */
              if (
                typeof res.result[prop] === 'object' &&
                Array.isArray(res.result[prop]) === false
              ) {
                for (let nested in res.result[prop]) {
                  this.info[prop][nested] = res.result[prop][nested]
                }
              } else {
                /** Update non-nested properties. */
                this.info[prop] = res.result[prop]
              }
            }
          }
        })
      })

      /** Start a new timeout for the specified preset. */
      this.infoPresets[preset].timeout = setTimeout(
        () => this.updateInfo(preset),
        this.infoPresets[preset].update
      )
    }
  }

  /**
   * Update wallet's lock status.
   * @function updateLockStatus
   */
  @action
  async updateLockStatus() {
    const res = await this.rpc.walletPassphrase()

    if ('error' in res === true) {
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
  }

  /**
   * Update unspent tx outputs.
   * @function updateUTXO
   */
  @action
  async updateUTXO() {
    const res = await this.rpc.listUnspent()

    runInAction(() => {
      this.utxo = res.result
    })
  }
}

export default WalletNext
