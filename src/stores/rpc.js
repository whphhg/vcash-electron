import { action, observable } from 'mobx'
import { notification, message } from 'antd'
import i18next from '../utilities/i18next'

/** Required store instances. */
import info from './info'

class RPC {
  /**
   * Observable properties.
   * @property {null|boolean} status - RPC connection status.
   */
  @observable status = null

  /**
   * Set RPC status.
   * @function setStatus
   * @param {boolean} status - RPC status.
   */
  @action setStatus (status) {
    this.status = status
  }

  /**
   * Execute RPC request(s).
   * @function exec
   * @param {array} options - RPC request objects.
   * @param {function} callback - Callback with RPC response or null if error.
   */
  exec (options, callback) {
    /** Add jsonrpc version and random id to each option. */
    options.map((option) => {
      option.jsonrpc = '2.0'
      option.id = Math.floor(Math.random() * 10000)
    })

    const init = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    }

    window
      .fetch('http://127.0.0.1:9195', init)
      .then((response) => { if (response.ok) return response.json() })
      .then((data) => {
        /** Set status to true if false or null. */
        if (this.status !== true) this.setStatus(true)

        return callback(data, options)
      })
      .catch((error) => {
        /** Set status to false if true or null. */
        if (this.status !== false) this.setStatus(false)

        /** Handle error.message. */
        console.error('RPC:', error.message)

        return callback(null)
      })
  }

  /**
   * Backup wallet to provided path.
   * @function backupWallet
   * @param {string} path - Backup path.
   * @param {function} callback - Call with RPC response and error (if any).
   */
  backupWallet (path, callback) {
    this.exec([
      { method: 'backupwallet', params: [path] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
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

        /** Upon success display a message. */
        if (response[0].hasOwnProperty('result') === true) {
          message.success(i18next.t('wallet:backedUp'), 6)
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Dump the private key of provided address.
   * @function dumpKey
   * @param {string} address - Address to dump the key of.
   * @param {function} callback - Call with RPC response and error (if any).
   */
  dumpKey (address, callback) {
    this.exec([
      { method: 'dumpprivkey', params: [address] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -4 = error_code_wallet_error */
              case -4:
                return 'unknownAddress'

              /** -5 = error_code_invalid_address_or_key */
              case -5:
                return 'invalidAddress'
            }
          }

          return false
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Dump wallet to a .csv file.
   * @function dumpWallet
   */
  dumpWallet () {
    this.exec([
      { method: 'dumpwallet', params: [] }
    ], (response) => {
      if (response !== null) {
        /** Upon success display a message. */
        if (response[0].hasOwnProperty('result') === true) {
          message.success(i18next.t('wallet:dumped'), 6)
        }
      }
    })
  }

  /**
   * Dump wallet seed.
   * @function dumpWalletSeed
   * @param {function} callback - Call with RPC response and error (if any).
   */
  dumpWalletSeed (callback) {
    this.exec([
      { method: 'dumpwalletseed', params: [] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
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
   * @function encryptWallet
   * @param {string} passphrase - Encrypt using this passphrase.
   */
  encryptWallet (passphrase) {
    this.exec([
      { method: 'encryptwallet', params: [passphrase] }
    ], (response) => {
      if (response !== null) {
        /** Upon success: */
        if (response[0].hasOwnProperty('result') === true) {
          /** Update lock status. */
          info.getLockStatus()

          /** Display notification. */
          notification.success({
            message: i18next.t('wallet:encrypted'),
            description: i18next.t('wallet:encryptedLong'),
            duration: 0
          })
        }
      }
    })
  }

  /**
   * Get new address.
   * @function getNewAddress
   * @param {string} account - Assign the address to this account.
   * @param {function} callback - Call with RPC response and error (if any).
   */
  getNewAddress (account, callback) {
    this.exec([
      { method: 'getnewaddress', params: [account] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** - 12 = error_code_wallet_keypool_ran_out */
              case -12:
                return 'keypoolRanOut'
            }
          }

          return false
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Import the private key and assign it to the provided account.
   * @function importKey
   * @param {string} privateKey - Private key to import.
   * @param {string} account - Account to assign the key to.
   * @param {function} callback - Call with RPC response and error (if any).
   */
  importKey (privateKey, account, callback) {
    this.exec([
      { method: 'importprivkey', params: [privateKey, account] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            switch (response[0].error.code) {
              /** -4 = error_code_wallet_error */
              case -4:
                return 'isMine'

              /** -5 = error_code_invalid_address_or_key */
              case -5:
                return 'invalidKey'
            }
          }

          return false
        }

        /** Upon success display a message. */
        if (response[0].hasOwnProperty('result') === true) {
          message.success(i18next.t('wallet:privateKeyImported'), 6)
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Lock the wallet.
   * @function lockWallet
   */
  lockWallet () {
    /** If active, toggle ChainBlender off before locking the wallet. */
    if (info.isBlending === true) {
      this.toggleChainBlender()
    }

    this.exec([
      { method: 'walletlock', params: [] }
    ], (response) => {
      if (response !== null) {
        /** Upon success: */
        if (response[0].hasOwnProperty('result') === true) {
          /** Update lock status. */
          info.getLockStatus()

          /** Display a message. */
          message.success(i18next.t('wallet:locked'), 6)
        }
      }
    })
  }

  /**
   * Change wallet passphrase.
   * @function passphraseChange
   * @param {string} current - Current passphrase.
   * @param {string} next - Next passphrase.
   * @param {function} callback - Call with RPC response and error (if any).
   */
  passphraseChange (current, next, callback) {
    this.exec([
      { method: 'walletpassphrasechange', params: [current, next] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
        const error = () => {
          if (response[0].hasOwnProperty('error') === true) {
            /** Update lock status. */
            info.getLockStatus()

            switch (response[0].error.code) {
              /** -14 = error_code_wallet_passphrase_incorrect */
              case -14:
                return 'incorrectPassphrase'
            }
          }

          return false
        }

        /** Upon success display a message. */
        if (response[0].hasOwnProperty('result') === true) {
          message.success(i18next.t('wallet:passphraseChanged'), 6)
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Toggle ChainBlender.
   * @function toggleChainBlender
   */
  toggleChainBlender () {
    this.exec([
      {
        method: 'chainblender',
        params: [info.isBlending === true ? 'stop' : 'start']
      }
    ], (response) => {
      if (response !== null) {
        /** Upon success: */
        if (response[0].hasOwnProperty('result') === true) {
          /** Update blending status. */
          info.setBlendingStatus()

          /** Display a message. */
          message.success(
            i18next.t('wallet:chainBlender',
              {
                context: info.isBlending === true ? 'start' : 'stop'
              }
            ), 6
          )
        }
      }
    })
  }

  /**
   * Unlock the wallet.
   * @function unlockWallet
   * @param {string} passphrase - Use this passphrase to unlock.
   * @param {function} callback - Call with RPC response and error (if any).
   */
  unlockWallet (passphrase, callback) {
    this.exec([
      { method: 'walletpassphrase', params: [passphrase] }
    ], (response) => {
      if (response !== null) {
        /** Convert error code to string or return false if none. */
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

        /** Upon success: */
        if (response[0].hasOwnProperty('result') === true) {
          /** Update lock status. */
          info.getLockStatus()

          /** Display a message. */
          message.success(i18next.t('wallet:unlocked'), 6)
        }

        return callback(response[0].result, error())
      }
    })
  }

  /**
   * Lock provided transaction.
   * @function ztlock
   * @param {string} txid - Txid of the transaction to lock.
   */
  ztlock (txid) {
    this.exec([
      { method: 'ztlock', params: [txid] }
    ], (response) => {
      if (response !== null) {}
    })
  }
}

/** Initialize a new globally used store. */
const rpc = new RPC()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default rpc
export { RPC }
