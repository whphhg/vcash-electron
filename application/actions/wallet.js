import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

export const walletDaemon = (isRunning) => ({
  type: types.WALLET_DAEMON,
  isRunning
})

export const walletInfo = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'getinfo',
      params: []
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        const properties = Object.keys(getState().wallet.info)
        let update = false

        response.result.version = response.result.version.split(':')[1]

        for (let i in properties) {
          if (response.result[properties[i].toLowerCase()] !== getState().wallet.info[properties[i]]) {
            update = true
            break
          }
        }

        if (update) {
          dispatch({
            type: types.WALLET_INFO,
            ...response.result
          })
        }
      } else {
        process.env.NODE_ENV === 'development' && console.warn('RPC: Attempted updating wallet info, next in 10s.')
      }

      setTimeout(() => {
        dispatch(walletInfo())
      }, 10 * 1000)
    })
  }
}

export const walletLockCheck = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'walletpassphrase',
      params: []
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        let isLocked = false
        let isEncrypted = false

        /**
         * error_code_wallet_wrong_enc_state = -15 (unencrypted)
         * error_code_wallet_already_unlocked = -17 (encrypted and unlocked)
         * error_code_invalid_params = -32602 (encrypted and locked)
         */
        switch (response.error.code) {
          case -17:
            isLocked = false
            isEncrypted = true
          break

          case -32602:
            isLocked = true
            isEncrypted = true
          break
        }

        dispatch({
          type: types.WALLET_LOCK_CHECK,
          isLocked,
          isEncrypted
        })
      }
    })
  }
}
