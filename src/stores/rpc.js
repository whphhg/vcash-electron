import { action, observable } from 'mobx'

/** RPC store class. */
class RPC {
  @observable status

  /**
   * @constructor
   * @property {null|boolean} status - RPC connection status.
   */
  constructor() {
    this.status = null
  }

  /**
   * Set RPC status.
   * @function setStatus
   * @param {boolean} status - RPC status.
   */
  @action setStatus(status) { this.status = status }

  /**
   * Execute RPC request(s).
   * @function call
   * @param {array} options - RPC request objects.
   * @param {function} callback - Function to call with RPC response or null if error.
   */
  call(options, callback) {
    options.map((option) => {
      option.jsonrpc = '2.0'
      option.id = Math.floor(Math.random() * 10000)
    })

    fetch('http://127.0.0.1:9195', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })
    .then((response) => { if (response.ok) return response.json() })
    .then((data) => {
      if (this.status !== true) this.setStatus(true)
      return callback(data)
    })
    .catch((error) => {
      if (this.status !== false) this.setStatus(false)
      return callback(null)
    })
  }
}

/** Initialize a new globally used store. */
const rpc = new RPC()

/** Export both, initialized store as default export, and store class as named export. */
export default rpc
export { RPC }
