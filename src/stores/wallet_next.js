import { action, computed, extendObservable, reaction } from 'mobx'
import { shortUid } from '../utilities/common'

class WalletNext {
  constructor (gui, rates, rpc) {
    this.gui = gui
    this.rates = rates
    this.rpc = rpc
    this.timeouts = { network: null, wallet: null }

    extendObservable(this, {
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
      isEncrypted: false,
      isLocked: false
    })

    /** React to RPC connectivity changes. */
    reaction(
      () => this.rpc.ready,
      ready => {
        if (ready === true) {
          /** Start this.info update loop presets. */
          for (let preset of ['wallet', 'network']) this.getInfo(preset)

          /** Update wallet's lock status. */
          this.getLockStatus()
        }

        if (ready === false) {
          /** Clear this.info update loop presets timeouts. */
          Object.keys(this.timeouts).forEach(preset =>
            clearTimeout(this.timeouts[preset])
          )
        }
      }
    )
  }

  /**
   * Get peers info.
   * @function peers
   * @return {array} Peers.
   */
  @computed
  get peers () {
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
  get syncPercent () {
    const peersHeight = this.peers.reduce((height, peer) => {
      if (peer.startingheight > height) return peer.startingheight
      return height
    }, this.info.blocks)

    return this.info.blocks / peersHeight * 100
  }

  /**
   * Update this.info properties present in the RPC response(s).
   * @function setInfo
   * @param {array} res - RPC response(s).
   * @param {array} req - RPC method and params object(s).
   */
  @action
  setInfo (res, req) {
    const assignTo = {
      getpeerinfo: 'peers',
      getunconfirmedbalance: 'unconfirmed'
    }

    res.forEach((res, index) => {
      if ('result' in res === false) return

      /** Set the results of RPC methods in assignTo to assigned properties. */
      if (req[index].method in assignTo === true) {
        this.info[assignTo[req[index].method]] = res.result
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
  }

  /**
   * Set wallet's lock status.
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
   * Get this.info properties present in the specified preset of RPC requests.
   * @function getInfo
   * @param {string} preset - Presets: network and wallet.
   */
  async getInfo (preset = 'wallet') {
    clearTimeout(this.timeouts[preset])

    let presets = {
      network: {
        update: 60 * 1000,
        requests: [
          { method: 'getnetworkinfo', params: [] },
          { method: 'getpeerinfo', params: [] },
          { method: 'getincentiveinfo', params: [] },
          { method: 'getmininginfo', params: [] },
          { method: 'getdifficulty', params: [] }
        ]
      },
      wallet: {
        update: 10 * 1000,
        requests: [
          { method: 'getinfo', params: [] },
          { method: 'getunconfirmedbalance', params: [] },
          { method: 'chainblender', params: ['info'] }
        ]
      }
    }

    const res = await this.rpc.batch(presets[preset].requests)

    if ('res' in res === true) {
      this.setInfo(res.res, res.req)

      /** Start a new timeout for the preset. */
      this.timeouts[preset] = setTimeout(
        () => this.getInfo(preset),
        presets[preset].update
      )
    }
  }

  /**
   * Get wallet's lock status.
   * @function getLockStatus
   */
  async getLockStatus () {
    const res = await this.rpc.walletPassphrase()

    /** -15 Unencrypted, -17 Unlocked, -32602 Locked */
    switch (res.error.code) {
      case -15:
        return this.setLockStatus(false, false)
      case -17:
        return this.setLockStatus(true, false)
      case -32602:
        return this.setLockStatus(true, true)
    }
  }
}

export default WalletNext
