import { action, computed, observable } from 'mobx'
import rpc from '../utilities/rpc'

/** Wallet store class. */
class Wallet {
  @observable balance
  @observable blocks
  @observable connections
  @observable ip
  @observable isEncrypted
  @observable isLocked
  @observable moneysupply
  @observable newmint
  @observable port
  @observable protocolversion
  @observable stake
  @observable version
  @observable walletversion
  @observable drawer

  /**
   * Prepare observable variables and run RPC info and lockCheck functions.
   * @constructor
   * @property {number} balance - Wallet balance.
   * @property {number} blocks - Daemon block height.
   * @property {number} connections - TCP connections.
   * @property {string} ip - Wallet IP.
   * @property {boolean} isEncrypted - Is wallet encrypted/not.
   * @property {boolean} isLocked - Is wallet locked/not.
   * @property {number} moneysupply - Total money supply, with respect to daemon block height.
   * @property {number} newmint - Amount of minted coins.
   * @property {number} port - Wallet port.
   * @property {number} protocolversion - Protocol version.
   * @property {number} walletversion - Wallet version.
   * @property {boolean} drawer - Drawer status.
   */
  constructor() {
    this.balance = 0
    this.blocks = 0
    this.connections = 0
    this.ip = '0.0.0.0'
    this.isEncrypted = false
    this.isLocked = false
    this.moneysupply = 0
    this.newmint = 0
    this.port = 0
    this.protocolversion = 0
    this.stake = 0
    this.version = 0
    this.walletversion = 0
    this.drawer = false

    this.info()
    this.lockCheck()
  }

  /**
   * Set wallet info.
   * @function setInfo
   * @param {object} info - New wallet info.
   */
  @action setInfo(info) {
    for (let i in info) {
      if (this.hasOwnProperty(i)) {
        if (this[i] !== info[i]) {
          this[i] = info[i]
        }
      }
    }
  }

  /**
   * Set wallet status (locked/encrypted).
   * @function setStatus
   * @param {boolean} isLocked - Is wallet locked/not.
   * @param {boolean} isEncrypted - Is wallet encrypted/not.
   */
  @action setStatus(isLocked, isEncrypted) {
    this.isLocked = isLocked
    this.isEncrypted = isEncrypted
  }

  /**
   * Toggle menu drawer.
   * @function toggleMenu
   */
  @action toggleMenu() {
    this.drawer = !this.drawer
  }

  /**
   * Get wallet info.
   * @function info
   */
  info() {
    rpc({ method: 'getinfo', params: [] }, (response) => {
      if (response !== null) {
        response.result.version = response.result.version.split(':')[1]
        this.setInfo(response.result)
      }

      setTimeout(() => { this.info() }, 10 * 1000)
    })
  }

  /**
   * Wallet lock check.
   * @function lockCheck
   */
  lockCheck() {
    rpc({ method: 'walletpassphrase', params: [] }, (response) => {
      if (response !== null) {
        /**
         * error_code_wallet_wrong_enc_state = -15 (unencrypted)
         * error_code_wallet_already_unlocked = -17 (encrypted and unlocked)
         * error_code_invalid_params = -32602 (encrypted and locked)
         */
        switch (response.error.code) {
          case -17:
            this.setStatus(false, true)
            break

          case -32602:
            this.setStatus(true, true)
            break
        }
      }
    })
  }
}

const wallet = new Wallet()

export default wallet
export { Wallet }
