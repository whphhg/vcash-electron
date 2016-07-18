import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

// FIXME: Transaction dialog not complete, needs overhaul, fails opening if PoS.
const transactionLookup = (txid) => {
  return (dispatch, getState) => {
    const options = {
      method: 'gettransaction',
      params: [txid]
    }

    let updateTimer = getState().ui.transaction.updateTimer
    clearTimeout(updateTimer)

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        let options = []

        response.result.vin.forEach((input) => {
          options.push({
            method: 'gettransaction',
            params: [input.txid]
          })

          process.env.NODE_ENV === 'development' && console.log(input.txid, input.vout)
        })

        rpc(options, dispatch, getState, (lookups) => {
          if (lookups !== null) {
            // Go through each input and get its address and amount.
            for (let i = 0; i < response.result.vin.length; i++) {
              response.result.vin[i].details = {
                address: lookups[i].result.vout[response.result.vin[i].vout].scriptPubKey.addresses[0],
                amount: lookups[i].result.vout[response.result.vin[i].vout].value,
              }
            }

            // Go through each output and check if it's remainder.
            response.result.vout.forEach((output) => {
              output.isRemainder = true

              if (response.result.hasOwnProperty('details')) {
                response.result.details.forEach((detail) => {
                  if (output.scriptPubKey.addresses[0] === detail.address) {
                    output.isRemainder = false
                  }
                })
              }
            })

            updateTimer = setTimeout(() => {
              dispatch(transactionLookup(txid))
            }, 30 * 1000)

            dispatch({
              type: types.TRANSACTION_LOOKUP,
              result: response.result,
              updateTimer
            })
          }
        })
      } else {
        process.env.NODE_ENV === 'development' && console.warn('RPC: Attempted updating transaction info, next in 10s.')
        setTimeout(() => {
          return dispatch(transactionLookup(txid))
        }, 10 * 1000)
      }
    })

  }
}

export const transactionToggleDialog = (txid) => {
  return (dispatch, getState) => {
    txid = typeof txid === 'string' ? txid : false

    if (txid) {
      if (getState().ui.transaction.isOpen === false) {
        dispatch({
          type: types.TRANSACTION_TOGGLE_DIALOG
        })
      }

      dispatch(transactionLookup(txid))
    } else {
      clearTimeout(getState().ui.transaction.updateTimer)

      dispatch({
        type: types.TRANSACTION_TOGGLE_DIALOG
      })
    }
  }
}
