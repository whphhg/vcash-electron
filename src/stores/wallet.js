import { action, observable, reaction } from 'mobx'
import { notification } from 'antd'

/** Required store instances. */
import rpc from './rpc'
import chainBlender from './chainBlender'

/** Wallet store class. */
class Wallet {
  /**
   * Observable properties.
   * @property {object} info - getinfo RPC response.
   * @property {object} incentive - getincentiveinfo RPC response.
   * @property {boolean} isEncrypted - Wallet encryption status.
   * @property {boolean} isLocked - Wallet lock status.
   */
  @observable info = { balance: 0, blocks: 0, connections: 0, ip: '0.0.0.0', moneysupply: 0, newmint: 0, port: 0, protocolversion: 0, stake: 0, version: ':', walletversion: 0 }
  @observable incentive = { walletaddress: '', collateralrequired: 0, collateralbalance: 0, networkstatus: 'firewalled', votecandidate: false }
  @observable isEncrypted = false
  @observable isLocked = false

  constructor() {
    /** Start the only infinite RPC update loop. */
    this.getinfo()

    /** Start update loop and check lock status when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) {
        this.getincentiveinfo()
        this.lockCheck()
      }
    })
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {string} key - Store key to compare against and update.
   * @param {object} response - RPC response object.
   */
  @action setResponse(key, response) {
    for (let i in this[key]) {
      if (this[key][i] !== response[i]) this[key][i] = response[i]
    }
  }

  /**
   * Set wallet lock status.
   * @function setStatus
   * @param {boolean} isEncrypted - Wallet encryption status.
   * @param {boolean} isLocked - Wallet lock status.
   */
  @action setStatus(isEncrypted, isLocked) {
    this.isLocked = isLocked
    this.isEncrypted = isEncrypted
  }

  /**
   * Get wallet info.
   * @function getinfo
   */
  getinfo() {
    rpc.call([{ method: 'getinfo', params: [] }], (response) => {
      if (response !== null) {
        this.setResponse('info', response[0].result)
      }

      /** Infinitely loop every 10 seconds. */
      setTimeout(() => { this.getinfo() }, 10 * 1000)
    })
  }

  /**
   * Get incentive info.
   * @function getincentiveinfo
   */
  getincentiveinfo() {
    rpc.call([{ method: 'getincentiveinfo', params: [] }], (response) => {
      if (response !== null) {
        this.setResponse('incentive', response[0].result)

        /** Loop every 20 seconds when RPC is available, else stop. */
        setTimeout(() => { this.getincentiveinfo() }, 20 * 1000)
      }
    })
  }

  /**
   * Lock wallet.
   * @function walletlock
   */
  walletlock() {
    /** If active, toggle ChainBlender off before locking the wallet. */
    if (chainBlender.status === true) chainBlender.toggle()

    rpc.call([{ method: 'walletlock', params: [] }], (response) => {
      if (response !== null) {
        this.lockCheck()
        notification.success({
          message: 'Locked',
          description: 'The wallet has been locked.',
          duration: 6
        })
      }
    })
  }

  /**
   * Wallet lock check.
   * @function lockCheck
   */
  lockCheck() {
    rpc.call([{ method: 'walletpassphrase', params: [] }], (response) => {
      if (response !== null) {
        switch (response[0].error.code) {
          /** Unencrypted: error_code_wallet_wrong_enc_state = -15 */
          case -15:
            return this.setStatus(false, false)

          /** Encrypted and unlocked: error_code_wallet_already_unlocked = -17 */
          case -17:
            return this.setStatus(true, false)

          /** Encrypted and locked: error_code_invalid_params = -32602 */
          case -32602:
            return this.setStatus(true, true)
        }
      }
    })
  }
}

/** Initialize a new globally used store. */
const wallet = new Wallet()

/** Export both, initialized store as default export, and store class as named export. */
export default wallet
export { Wallet }
