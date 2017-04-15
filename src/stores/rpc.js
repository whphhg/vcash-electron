import { computed, reaction } from 'mobx'

export default class RPC {
  /**
   * @constructor
   * @param {object} connection - Connection settings and status.
   * @param {function} setStatus - Set connection status.
   * @property {number|null} testTimeout - testExecute() timeout id.
   */
  constructor (connection, setStatus) {
    this.connection = connection
    this.setStatus = setStatus
    this.testTimeout = null

    /** Test execute() on start-up. */
    reaction(() => this.connection.status.active, (active) => {
      if (active === true && this.connection.type === 'local') {
        this.testExecute()
      }

      /** Clear timeout on shut-down. */
      if (active === false) clearTimeout(this.testTimeout)
    })

    /** Test execute() on SSH tunnel ready. */
    reaction(() => this.connection.status.tunnel, (tunnel) => {
      if (tunnel === true) this.testExecute()
    })
  }

  /**
   * Get RPC status.
   * @function ready
   * @return {boolean} RPC status.
   */
  @computed get ready () {
    if (this.connection.status.active === false) return false
    return this.connection.status.rpc
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
      .fetch('http://127.0.0.1:' + this.connection.localPort, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })
      .then((response) => {
        if (response.ok === true) return response.json()
      })
      .then((data) => {
        /** Update connection status. */
        if (this.connection.status.rpc !== true) {
          this.setStatus(this.connection.uid, { rpc: true })
        }

        return callback(data, options)
      })
      .catch((error) => {
        /** Update connection status. */
        if (
          this.connection.status.rpc !== false ||
          this.testTimeout === null
        ) {
          this.setStatus(this.connection.uid, { rpc: false })
        }

        /** Log error to the console. */
        console.error('RPC:', error.message)

        /** Test execute every 5s until daemon is reachable. */
        this.testTimeout = setTimeout(() => { this.testExecute() }, 5 * 1000)
      })
  }

  /**
   * Test execute() connectivity.
   * @function testExecute
   */
  testExecute () {
    /** Clear previous timeout id. */
    clearTimeout(this.testTimeout)

    /** Try getinfo RPC method. */
    this.execute([{ method: 'getinfo', params: [] }], (response) => {})
  }
}
