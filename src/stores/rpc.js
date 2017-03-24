import { action, observable } from 'mobx'

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
   * @function execute
   * @param {array} options - RPC request objects.
   * @param {function} callback - Callback for RPC response.
   */
  execute (options, callback) {
    /** Add jsonrpc version and random id to each option. */
    options.map((option) => {
      option.jsonrpc = '2.0'
      option.id = Math.floor(Math.random() * 10000)
    })

    window
      .fetch('http://127.0.0.1:9195', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      .then((response) => {
        if (response.ok) return response.json()
      })
      .then((data) => {
        if (this.status !== true) this.setStatus(true)
        return callback(data, options)
      })
      .catch((error) => {
        if (this.status !== false) this.setStatus(false)
        console.error('RPC:', error.message)
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
