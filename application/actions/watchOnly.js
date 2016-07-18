import * as types from '../constants/ActionTypes'
import explorerLookup from '../utilities/explorerLookup'

export const watchOnlyAdd = (address, note) => ({
  type: types.WATCHONLY_ADD,
  address,
  note
})

export const watchOnlyEdit = (address, note) => ({
  type: types.WATCHONLY_EDIT,
  address,
  note
})

export const watchOnlyExplorerLookup = () => {
  return (dispatch, getState) => {
    clearTimeout(getState().watchOnly.updateTimer)

    let addresses = getState().watchOnly.addresses
    let promises = []

    const neverUpdated = addresses.filter((address) => {
      return getState().watchOnly.byAddress[address].lastUpdate === 0
    })

    if (neverUpdated.length > 0) {
      addresses = neverUpdated
    }

    if (addresses.length > 0) {
      addresses.map((address, i) => {
        promises.push(new Promise((resolve, reject) => {
          setTimeout(() => {
            explorerLookup(address, (response) => {
              if (response !== null) {
                process.env.NODE_ENV === 'development' && console.info('HTTPS: Explorer lookup ' + address + ' (' + i + ').')
                resolve(response)
              } else {
                reject('')
              }
            })
          }, i * 400)
        }))
      })

      Promise.all(promises).then(
        function AcceptHandler(responses) {
          const byAddress = responses.reduce((byAddress, response) => {
            byAddress[response.address] = {
              balance: parseFloat(response.balance).toFixed(6),
              transactions: response.last_txs
            }

            return byAddress
          }, {})

          const updateTimer = setTimeout(() => {
            dispatch(watchOnlyExplorerLookup())
          }, 600 * 1000)

          dispatch({
            type: types.WATCHONLY_EXPLORER_LOOKUP,
            byAddress,
            updateTimer
          })
        },
        function ErrorHandler(error) {
          process.env.NODE_ENV === 'development' && console.error('RPC: Attempted updating watch-only addresses explorer data. Next in 5 minutes. Error: ' + error)
          setTimeout(() => {
            dispatch(watchOnlyExplorerLookup())
          }, 300 * 1000)
        }
      )
    }
  }
}

export const watchOnlyRemove = (address) => ({
  type: types.WATCHONLY_REMOVE,
  address
})
