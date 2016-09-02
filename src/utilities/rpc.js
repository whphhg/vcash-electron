/** Required store instances. */
import daemon from '../stores/daemon'

/**
 * TODO: Allow selecting the daemon you're getting data from, local or remote (tunnel-ssh).
 *       - ssh -L9195:localhost:9195 user@ip
 *
 * Make RPC to Vcash daemon.
 * @function rpc
 * @param {object|array} options - Can be a single object with a method and params, or an array of such objects.
 * @param {function} callback - Function to call with response.
 * @return {callback} Callback with response object or null.
 */
const rpc = (options, callback) => {
  if (options.constructor === Array) {
    options.map((option) => {
      option.jsonrpc = '2.0'
      option.id = Math.floor(Math.random() * 10000)
    })
  } else {
    options.jsonrpc = '2.0'
    options.id = Math.floor(Math.random() * 10000)
  }

  fetch('http://127.0.0.1:9195', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options)
  })
    .then((response) => { if (response.ok) return response.json() })
    .then((data) => {
      if (daemon.isRunning === false || daemon.isRunning === null) {
        daemon.setRunning(true)
      }

      return callback(data)
    })
    .catch((error) => {
      if (daemon.isRunning || daemon.isRunning === null) {
        daemon.setRunning(false)
      }

      return callback(null)
    })
}

export default rpc
