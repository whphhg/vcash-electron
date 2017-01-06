import { action, observable, reaction } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

/** Required store instances. */
import rpc from './rpc'
import chainBlender from './chainBlender'

class Wallet {
  /**
   * Observable properties.
   * @property {boolean} isEncrypted - Wallet encryption status.
   * @property {boolean} isLocked - Wallet lock status.
   * @property {object} info - getinfo RPC response.
   * @property {object} incentive - getincentiveinfo RPC response.
   */
  @observable isEncrypted = false
  @observable isLocked = false
  @observable info = {
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
  @observable incentive = {
    walletaddress: '',
    collateralrequired: 0,
    collateralbalance: 0,
    networkstatus: 'firewalled',
    votecandidate: false,
    votescore: 0
  }

  constructor () {
    /** Start the only infinite RPC update loop. */
    this.getinfo()

    /** Check lock status when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) this.lockCheck()
    })
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {object} info - getinfo RPC response.
   * @param {object} incentive - getincentiveinfo RPC response.
   */
  @action setResponse (info, incentive) {
    /** Update wallet info. */
    for (let i in info) {
      if (this.info[i] !== info[i]) {
        this.info[i] = info[i]
      }
    }

    /** Update incentive info. */
    for (let i in incentive) {
      if (this.incentive[i] !== incentive[i]) {
        this.incentive[i] = incentive[i]
      }
    }
  }

  /**
   * Set wallet lock status.
   * @function setStatus
   * @param {boolean} isEncrypted - Wallet encryption status.
   * @param {boolean} isLocked - Wallet lock status.
   */
  @action setStatus (isEncrypted, isLocked) {
    this.isLocked = isLocked
    this.isEncrypted = isEncrypted
  }

  /**
   * Get wallet and incentive info.
   * @function getinfo
   */
  getinfo () {
    rpc.call([
      {
        method: 'getinfo',
        params: []
      },
      {
        method: 'getincentiveinfo',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        /** Set the response. */
        this.setResponse(response[0].result, response[1].result)
      }

      /** Infinitely loop every 10 seconds. */
      setTimeout(() => { this.getinfo() }, 10 * 1000)
    })
  }

  /**
   * Lock wallet.
   * @function walletlock
   */
  walletlock () {
    /** If active, toggle ChainBlender off before locking the wallet. */
    if (chainBlender.status === true) chainBlender.toggle()

    rpc.call([
      {
        method: 'walletlock',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        /** Update wallet status. */
        this.lockCheck()

        /** Display notification. */
        notification.success({
          message: i18next.t('wallet:locked'),
          description: i18next.t('wallet:lockedLong'),
          duration: 6
        })
      }
    })
  }

  /**
   * Dump wallet.
   * @function dumpwallet
   */
  dumpwallet () {
    rpc.call([
      {
        method: 'dumpwallet',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        /** Display notification. */
        notification.success({
          message: i18next.t('wallet:dumped'),
          description: i18next.t('wallet:dumpedLong'),
          duration: 6
        })
      }
    })
  }

  /**
   * Wallet lock check.
   * @function lockCheck
   */
  lockCheck () {
    rpc.call([
      {
        method: 'walletpassphrase',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        switch (response[0].error.code) {
          /**
           * Unencrypted,
           * error_code_wallet_wrong_enc_state = -15
           */
          case -15:
            return this.setStatus(false, false)

          /**
           * Encrypted and unlocked,
           * error_code_wallet_already_unlocked = -17
           */
          case -17:
            return this.setStatus(true, false)

          /**
           * Encrypted and locked,
           * error_code_invalid_params = -32602
           */
          case -32602:
            return this.setStatus(true, true)
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
