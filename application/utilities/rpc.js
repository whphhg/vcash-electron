import http from 'http'
import { walletDaemon, walletLockCheck } from '../actions/wallet'

// Options can be a single object with a method and params, or an array of such objects.
const rpc = (options, dispatch, getState, callback) => {
  const request = http.request({
    host: '127.0.0.1',
    port: 9195,
    method: 'POST'
  })

  // Assign random ids and jsonrpc version property.
  if (Object.prototype.toString.call(options) === '[object Object]') {
    options.jsonrpc = '2.0'
    options.id = Math.floor(Math.random() * (10000 - 210 + 1)) + 210
  } else {
    options.map((option) => {
      option.jsonrpc = '2.0'
      option.id = Math.floor(Math.random() * (10000 - 210 + 1)) + 210
    })
  }

  // Serialize options and finish sending the request.
  request.end(JSON.stringify(options))

  request.on('error', (error) => {
    if (getState().wallet.status.isRunning || getState().wallet.status.isRunning === null) {
      dispatch(walletDaemon(false))
    }

    callback(null)
  })

  request.on('response', (response) => {
    let buffer = ''

    response.on('data', (data) => {
      buffer += data
    })

    response.on('end', () => {
      if (!getState().wallet.status.isRunning || getState().wallet.status.isRunning === null) {
        dispatch(walletDaemon(true))
        dispatch(walletLockCheck())
      }

      try {
        callback(JSON.parse(buffer))
      } catch (exception) {
        process.env.NODE_ENV === 'development' && console.error('RPC: Error parsing response.', options, exception)
        callback(null)
      }
    })
  })
}

export default rpc
