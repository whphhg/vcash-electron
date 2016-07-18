import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

export const addressBook = () => {
  return (dispatch, getState) => {
    const options =  {
      method: 'listreceivedbyaddress',
      params: [0, true]
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        let byAccount = {}

        response.result.map((obj) => {
          if (obj.account === '') {
            obj.account = 'Default'
          }

          if (!byAccount[obj.account]) {
            byAccount[obj.account] = {
              balance: 0,
              addresses: []
            }
          }

          byAccount[obj.account].addresses.push({
            address: obj.address,
            received: obj.amount
          })
        })

        const accounts = Object.keys(byAccount)
        const options = []

        accounts.map((account) => {
          options.push({
            method: 'getbalance',
            params: [account === 'Default' ? '' : account]
          })
        })

        rpc(options, dispatch, getState, (response) => {
          if (response !== null) {
            for (let i = 0; i < accounts.length; i++) {
              byAccount[accounts[i]].balance = response[i].result
            }

            // Set wallet balance.
            byAccount['#All'] = {
              balance: getState().wallet.info.balance
            }

            // Sort accounts by name.
            accounts.sort(function(a, b) {
              if (a.toLowerCase() < b.toLowerCase()) {
                return -1
              }

              if (a.toLowerCase() > b.toLowerCase()) {
                return 1
              }

              return 0
            })

            dispatch({
              type: types.ADDRESS_BOOK,
              accounts,
              byAccount
            })
          }
        })
      }
    })
  }
}

export const addressBookSetShowAccount = (showAccount) => ({
  type: types.ADDRESS_BOOK_SET_SHOW_ACCOUNT,
  showAccount
})
