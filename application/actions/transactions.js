import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import { addressBook } from './addressBook'
import moment from 'moment'

/**
 * TODO: Combine self-sends and correctly handle category names, similar to WebUI.
 *
 * Sending -> Sent, Receiving -> Received, Blended, Immature, PoS, PoW, Incentive
 */
export const transactions = (lastBlock = '') => {
  return (dispatch, getState) => {
    const options = {
      method: 'listsinceblock',
      params: [lastBlock]
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        const txList = response.result.transactions
        let confirmed = []
        let unconfirmed = []
        let unconfirmedTotal = 0
        let update = false

        if (txList.length > 0) {
          txList.map((tx) => {
            if (tx.confirmations > 0) {
              confirmed.push(tx)
            } else {
              unconfirmed.push(tx)

              if (tx.amount > 0) {
                unconfirmedTotal += tx.amount
              }
            }
          })

          // Skip comparing and update if there are confirmed transactions.
          if (confirmed.length > 0) {
            update = true
          }

          // Compare unconfirmed with those in state. Update if they differ.
          if (!update) {
            try {
              for (let i = 0; i < unconfirmed.length; i++) {
                if (unconfirmed[i].txid !== getState().transactions.unconfirmed[i].txid) {
                  update = true
                  break
                }
              }
            } catch (exception) {
              update = true
            }
          }

          if (update) {
            dispatch({
              type: types.TRANSACTIONS,
              confirmed,
              unconfirmed,
              unconfirmedTotal
            })

            if (confirmed.length > 0) {
              dispatch(addressBook())
            }
          }
        } else {
          // Update when running a new wallet with 0 txs.
          if (lastBlock === '') {
            dispatch(addressBook())
          }
        }

        process.env.NODE_ENV === 'development' && console.info('RPC: Updated transactions,',confirmed.length,'confirmed,',unconfirmed.length,'unconfirmed since block "'+lastBlock+'", next in 15s.')
        setTimeout(() => {
          dispatch(transactions(response.result.lastblock))
        }, 15 * 1000)
      } else {
        process.env.NODE_ENV === 'development' && console.warn('RPC: Attempted updating transactions, next in 10s.')
        setTimeout(() => {
          dispatch(transactions(lastBlock))
        }, 10 * 1000)
      }
    })
  }
}

export const transactionsSetFilterBy = (filterBy) => ({
  type: types.TRANSACTIONS_SET_FILTER_BY,
  filterBy: filterBy.split(' ').filter((filter) => { return filter !== '' })
})

export const transactionsSetShowCategory = (showCategory) => ({
  type: types.TRANSACTIONS_SET_SHOW_CATEGORY,
  showCategory
})

export const transactionsSetShowSince = (showSince) => ({
  type: types.TRANSACTIONS_SET_SHOW_SINCE,
  showSince
})
