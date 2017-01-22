import { action, observable, reaction } from 'mobx'
import { notification } from 'antd'
import i18next from '../utilities/i18next'

/** Required store instances. */
import rpc from './rpc'

class Wallet {
  @observable isBlending = false
  @observable isEncrypted = false
  @observable isLocked = false

  @observable chainBlender = {
    blendstate: 'none',
    balance: 0,
    denominatedbalance: 0,
    nondenominatedbalance: 0,
    blendedbalance: 0,
    blendedpercentage: 0
  }

  @observable incentive = {
    walletaddress: '',
    collateralrequired: 0,
    collateralbalance: 0,
    networkstatus: 'firewalled',
    votecandidate: false,
    votescore: 0
  }

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

  constructor () {
    this.loopTimeout = null

    /** Get fresh ChainBlender info when the wallet unlocks. */
    reaction(() => this.isLocked, (isLocked) => {
      if (isLocked === false) {
        /** Clear previous this.getinfo() setTimeout. */
        if (this.loopTimeout !== null) this.clearLoopTimeout()

        /** Re-start update loop. */
        this.getinfo()
      }
    })

    /** Start update loop. */
    this.getinfo()

    /** Check lock status when RPC becomes available. */
    reaction(() => rpc.status, (status) => {
      if (status === true) this.lockCheck()
    })
  }

  @action setResponses (responses) {
    const which = ['info', 'incentive', 'chainBlender']

    responses.forEach((response, index) => {
      if (response.hasOwnProperty('result') === true) {
        for (let i in response.result) {
          if (this[which[index]][i] !== response.result[i]) {
            this[which[index]][i] = response.result[i]
          }
        }

        /** Correct blending status if the daemon is already blending. */
        if (index === 2) {
          if (
            response.result.blendstate === 'active' ||
            response.result.blendstate === 'passive'
          ) {
            if (this.isBlending === false) {
              this.setBlendingStatus(true)
            }
          }
        }
      }
    })
  }

  @action setBlendingStatus (isBlending) {
    this.isBlending = isBlending
  }

  @action setLockStatus (isEncrypted, isLocked) {
    this.isLocked = isLocked
    this.isEncrypted = isEncrypted
  }

  @action clearLoopTimeout () {
    clearTimeout(this.loopTimeout)
    this.loopTimeout = null
  }

  @action setLoopTimeout () {
    this.loopTimeout = setTimeout(() => {
      this.getinfo()
    }, 10 * 1000)
  }

  /**
   * Get wallet, incentive and ChainBlender info.
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
      },
      {
        method: 'chainblender',
        params: ['info']
      }
    ], (response) => {
      if (response !== null) {
        this.setResponses(response)
      }

      this.setLoopTimeout()
    })
  }

  /**
   * Backup wallet.
   * @function backup
   * @param {string} path - Backup to this path.
   * @param {function} callback - Return result & error to this function.
   */
  backup (path, callback) {
    rpc.call([
      {
        method: 'backupwallet',
        params: [path]
      }
    ], (response) => {
      if (response !== null) {
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -4 = error_code_wallet_error */
              case -4:
                return 'backupFailed'
            }
          }

          return false
        }

        if (response[0].hasOwnProperty('result') === true) {
          /** Display notification. */
          notification.success({
            message: i18next.t('wallet:backedUp'),
            description: i18next.t('wallet:savedInto') + ' ' + path,
            duration: 6
          })
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Dump wallet.
   * @function dump
   */
  dump () {
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
   * Dump wallet seed.
   * @function dumpSeed
   * @param {function} callback - Return result & error to this function.
   */
  dumpSeed (callback) {
    rpc.call([
      {
        method: 'dumpwalletseed',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -4 = error_code_wallet_error */
              case -4:
                return 'notDeterministic'
            }
          }

          return false
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Encrypt the wallet.
   * @function encrypt
   * @param {string} passphrase - Encrypt using this passphrase.
   */
  encrypt (passphrase) {
    rpc.call([
      {
        method: 'encryptwallet',
        params: [passphrase]
      }
    ], (response) => {
      if (response !== null) {
        wallet.lockCheck()

        /** Display notification. */
        notification.success({
          message: i18next.t('wallet:encrypted'),
          description: i18next.t('wallet:encryptedLong'),
          duration: 0
        })
      }
    })
  }

  /**
   * Lock the wallet.
   * @function lock
   */
  lock () {
    /** If active, toggle ChainBlender off before locking the wallet. */
    if (this.isBlending === true) this.toggleBlender()

    rpc.call([
      {
        method: 'walletlock',
        params: []
      }
    ], (response) => {
      if (response !== null) {
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
   * Change wallet passphrase.
   * @function passphraseChange
   * @param {string} current - Current passphrase.
   * @param {string} next - Next passphrase.
   * @param {function} callback - Return result & error to this function.
   */
  passphraseChange (current, next, callback) {
    rpc.call([
      {
        method: 'walletpassphrasechange',
        params: [current, next]
      }
    ], (response) => {
      if (response !== null) {
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            this.lockCheck()

            switch (response[0].error.code) {
              /** -14 = error_code_wallet_passphrase_incorrect */
              case -14:
                return 'incorrectPassphrase'
            }
          }

          return false
        }

        if (response[0].hasOwnProperty('result') === true) {
          /** Display notification. */
          notification.success({
            message: i18next.t('wallet:passphraseChanged'),
            description: i18next.t('wallet:passphraseChangedLong'),
            duration: 6
          })
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Toggle ChainBlender.
   * @function toggle
   */
  toggleBlender () {
    rpc.call([
      {
        method: 'chainblender',
        params: [this.isBlending === true ? 'stop' : 'start']
      }
    ], (response) => {
      if (response !== null) {
        /** Set the status. */
        this.setBlendingStatus(!this.isBlending)

        /** Display notification. */
        notification.success({
          message: 'ChainBlender',
          description: i18next.t('wallet:chainBlender',
            {
              context: this.isBlending === true ? 'start' : 'stop'
            }
          ),
          duration: 6
        })
      }
    })
  }

  /**
   * Unlock the wallet.
   * @function unlock
   * @param {string} passphrase - Use this passphrase to unlock.
   * @param {function} callback - Return result & error to this function.
   */
  unlock (passphrase, callback) {
    rpc.call([
      {
        method: 'walletpassphrase',
        params: [passphrase]
      }
    ], (response) => {
      if (response !== null) {
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -14 = error_code_wallet_passphrase_incorrect */
              case -14:
                return 'incorrectPassphrase'
            }
          }

          return false
        }

        if (response[0].hasOwnProperty('result') === true) {
          this.lockCheck()

          /** Display notification. */
          notification.success({
            message: i18next.t('wallet:unlocked'),
            description: i18next.t('wallet:unlockedLong'),
            duration: 6
          })
        }

        return callback(response[0].result, error())
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
