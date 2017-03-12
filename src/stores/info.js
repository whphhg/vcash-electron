import { action, computed, observable, reaction } from 'mobx'
import { shortUid } from '../utilities/common'

/** Required store instances. */
import rpc from './rpc'

class Info {
  /**
   * Observable properties.
   * @property {map} responses - Saved RPC responses.
   * @property {boolean} isBlending - Blending status.
   * @property {boolean} isEncrypted - Encrypted status.
   * @property {boolean} isLocked - Locked status.
   */
  @observable responses = observable.map({})
  @observable isBlending = false
  @observable isEncrypted = false
  @observable isLocked = false

  constructor () {
    this.timeouts = {
      getNetworkInfo: null,
      getWalletInfo: null
    }

    /** Start wallet info update loop. */
    this.getWalletInfo()

    /** When RPC becomes available: */
    reaction(() => rpc.status, (status) => {
      if (status === true) {
        /** Restart network info update loop. */
        this.restart('getNetworkInfo')

        /** Update lock status. */
        this.getLockStatus()
      }
    })

    /**
     * Restart network info update loop after 8 seconds,
     * when the wallet gets unlocked for the first time.
     */
    reaction(() => this.isLocked, (isLocked) => {
      if (isLocked === false) {
        if (this.responses.has('getincentiveinfo') === true) {
          const info = this.responses.get('getincentiveinfo')

          if (info.walletaddress === '') {
            this.restart('getNetworkInfo')
          }
        }
      }
    }, { delay: 8000 })

    /** Restart wallet info update loop when the wallet gets unlocked. */
    reaction(() => this.isLocked, (isLocked) => {
      if (isLocked === false) {
        this.restart('getWalletInfo')
      }
    })
  }

  /**
   * Set blending status.
   * @function setBlendingStatus
   */
  @action setBlendingStatus () {
    this.isBlending = !this.isBlending
  }

  /**
   * Set RPC responses.
   * @function setInfo
   * @param {array} responses - RPC responses.
   * @param {array} options - RPC options.
   */
  @action setInfo (responses, options) {
    responses.forEach((response, index) => {
      /** Exclude ChainBlender response when the wallet is locked. */
      if (response.hasOwnProperty('result') === true) {
        /** Update previous response or set a new one. */
        if (this.responses.has(options[index].method) === true) {
          let saved = this.responses.get(options[index].method)

          for (let i in response.result) {
            saved[i] = response.result[i]
          }
        } else {
          this.responses.set(
            options[index].method,
            response.result
          )
        }
      }
    })
  }

  /**
   * Set lock status.
   * @function setLockStatus
   * @param {boolean} isEncrypted - Encryption status.
   * @param {boolean} isLocked - Lock status.
   */
  @action setLockStatus (isEncrypted, isLocked) {
    this.isEncrypted = isEncrypted
    this.isLocked = isLocked
  }

  /**
   * Get ChainBlender info.
   * @function chainBlender
   * @return {object} Saved RPC response.
   */
  @computed get chainBlender () {
    if (this.responses.has('chainblender') === true) {
      return this.responses.get('chainblender')
    }

    return {
      blendstate: 'none',
      balance: 0,
      denominatedbalance: 0,
      nondenominatedbalance: 0,
      blendedbalance: 0,
      blendedpercentage: 0
    }
  }

  /**
   * Get difficulty info.
   * @function difficulty
   * @return {object} Saved RPC response.
   */
  @computed get difficulty () {
    if (this.responses.has('getdifficulty') === true) {
      return this.responses.get('getdifficulty')
    }

    return {
      'proof-of-work': 0,
      'proof-of-stake': 0,
      'search-interval': 0
    }
  }

  /**
   * Get incentive info.
   * @function incentive
   * @return {object} Saved RPC response.
   */
  @computed get incentive () {
    if (this.responses.has('getincentiveinfo') === true) {
      return this.responses.get('getincentiveinfo')
    }

    return {
      walletaddress: '',
      collateralrequired: 0,
      collateralbalance: 0,
      networkstatus: 'firewalled',
      votecandidate: false,
      votescore: 0
    }
  }

  /**
   * Get mining info.
   * @function mining
   * @return {object} Saved RPC response.
   */
  @computed get mining () {
    if (this.responses.has('getmininginfo') === true) {
      return this.responses.get('getmininginfo')
    }

    return {
      blocks: 0,
      currentblocksize: 0,
      currentblocktx: 0,
      difficulty: 0,
      errors: '',
      generate: false,
      genproclimit: 0,
      hashespersec: 0,
      networkhashps: 0,
      pooledtx: 0,
      testnet: false
    }
  }

  /**
   * Get network info.
   * @function network
   * @return {object} Saved RPC response.
   */
  @computed get network () {
    let saved = false

    if (this.responses.has('getnetworkinfo') === true) {
      saved = this.responses.get('getnetworkinfo')
    }

    return {
      udp: saved === false ? 0 : saved.udp.connections,
      tcp: saved === false ? 0 : saved.tcp.connections,
      endpoints: saved === false ? [] : saved.endpoints,
      collateralized: saved === false ? 0 : saved.collateralized
    }
  }

  /**
   * Get connected peers.
   * @function peers
   * @return {array} Saved RPC response.
   */
  @computed get peers () {
    if (this.responses.has('getpeerinfo') === true) {
      const peerInfo = this.responses.get('getpeerinfo')

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

    return []
  }

  /**
   * Get wallet info.
   * @function wallet
   * @return {object} Saved RPC response.
   */
  @computed get wallet () {
    if (this.responses.has('getinfo') === true) {
      return this.responses.get('getinfo')
    }

    return {
      version: ':',
      protocolversion: 0,
      walletversion: 0,
      balance: 0,
      newmint: 0,
      stake: 0,
      blocks: 0,
      moneysupply: 0,
      connections: 0,
      ip: '0.0.0.0',
      port: 0,
      difficulty: 0,
      keypoolsize: 0,
      paytxfee: 0
    }
  }

  /**
   * Get lock status.
   * @function getLockStatus
   */
  getLockStatus () {
    rpc.exec([
      { method: 'walletpassphrase', params: [] }
    ], (response) => {
      if (response !== null) {
        switch (response[0].error.code) {
          /**
           * Unencrypted,
           * error_code_wallet_wrong_enc_state = -15
           */
          case -15:
            return this.setLockStatus(false, false)

          /**
           * Encrypted and unlocked,
           * error_code_wallet_already_unlocked = -17
           */
          case -17:
            return this.setLockStatus(true, false)

          /**
           * Encrypted and locked,
           * error_code_invalid_params = -32602
           */
          case -32602:
            return this.setLockStatus(true, true)
        }
      }
    })
  }

  /**
   * Get network info.
   * @function getNetworkInfo
   */
  getNetworkInfo () {
    rpc.exec([
      { method: 'getnetworkinfo', params: [] },
      { method: 'getpeerinfo', params: [] },
      { method: 'getincentiveinfo', params: [] },
      { method: 'getmininginfo', params: [] },
      { method: 'getdifficulty', params: [] }
    ], (response, options) => {
      if (response !== null) {
        this.setInfo(response, options)

        /** Set a new timeout for 60 seconds. */
        this.timeouts.getNetworkInfo = setTimeout(() => {
          this.getNetworkInfo()
        }, 60 * 1000)
      }
    })
  }

  /**
   * Get wallet info.
   * @function getWalletInfo
   */
  getWalletInfo () {
    rpc.exec([
      { method: 'getinfo', params: [] },
      { method: 'chainblender', params: ['info'] }
    ], (response, options) => {
      if (response !== null) {
        this.setInfo(response, options)
      }

      /**
       * Set a new timeout for 10 seconds,
       * regardless of response success.
       */
      this.timeouts.getWalletInfo = setTimeout(() => {
        this.getWalletInfo()
      }, 10 * 1000)
    })
  }

  /**
   * Restart the provided update loop.
   * @function restart
   * @param {string} timeout - Timeout key.
   */
  restart (timeout) {
    /** Clear previous timeout id. */
    clearTimeout(this.timeouts[timeout])

    /** Restart the update loop. */
    this[timeout]()
  }
}

/** Initialize a new globally used store. */
const info = new Info()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default info
export { Info }
