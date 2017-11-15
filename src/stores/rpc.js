import { computed, reaction } from 'mobx'
import rpcs from '../utilities/rpcs'

class RPC {
  /**
   * @param {object} connection - Connection instance.
   * @prop {array} methods - RPC method names.
   * @prop {number|null} testTimeout - testRPC() timeout id.
   */
  constructor(connection) {
    this.connection = connection
    this.methods = Object.keys(rpcs)
    this.testTimeout = null

    /** Assign camelCase named RPC methods as functions wrapping batch(). */
    Object.keys(rpcs).forEach(method => {
      this[rpcs[method]] = async function() {
        const res = await this.batch([{ method, params: [...arguments] }], true)
        return res
      }
    })

    /** Test RPC on local connection start or clear testTimeout on stop. */
    reaction(
      () => this.connection.status.active,
      active => {
        if (active === true && this.connection.type === 'local') this.testRPC()
        if (active === false) clearTimeout(this.testTimeout)
      },
      { name: 'RPC: checking if connection started or stopped.' }
    )

    /** Test RPC on SSH tunnel ready. */
    reaction(
      () => this.connection.status.tunnel,
      tunnel => {
        if (tunnel === true) this.testRPC()
      },
      { name: 'RPC: checking if SSH tunnel started or stopped.' }
    )
  }

  /**
   * Get RPC status.
   * @function ready
   * @return {boolean} RPC status.
   */
  @computed
  get ready() {
    if (this.connection.status.active === false) return false
    return this.connection.status.rpc
  }

  /**
   * Make a single RPC request or a batch of RPC requests.
   * @function batch
   * @param {array} req - RPC method and params object(s).
   * @param {string} single - Return single response if only 1 RPC request.
   * @returns {object} Response(s) and request(s), single response, or empty.
   */
  async batch(req, single = false) {
    try {
      /** Add jsonrpc version and random id to each RPC request. */
      req.map(rpc => {
        rpc.jsonrpc = '2.0'
        rpc.id = Math.floor(Math.random() * 10000)
      })

      /** Serialize the RPC request(s) and make the POST request. */
      const request = await window.fetch(
        'http://127.0.0.1:' + this.connection.localPort,
        {
          method: 'POST',
          body: JSON.stringify(req)
        }
      )

      /** Get the JSON response(s). */
      const res = await request.json()

      /** Toggle connection RPC status if not true. */
      if (this.connection.status.rpc !== true) {
        this.connection.setStatus({ rpc: true })
      }

      /** Return a single response, or response(s) and request(s). */
      if (res.length === 1 && single === true) return res[0]
      return { res, req }
    } catch (error) {
      console.error('rpc.batch:', error.message)

      /** Reject invalid responses without altering the RPC status. */
      if (error.message.indexOf('Unexpected token') !== -1) return {}

      /** Toggle connection RPC status if not false. */
      if (this.connection.status.rpc !== false || this.testTimeout === null) {
        this.connection.setStatus({ rpc: false })
      }

      /** Test RPC every 5s until the daemon is connectable. */
      this.testTimeout = setTimeout(() => this.testRPC(), 5 * 1000)

      /** Return empty object on a failed request. */
      return {}
    }
  }

  /**
   * Test daemon RPC connectivity.
   * @function testRPC
   */
  async testRPC() {
    clearTimeout(this.testTimeout)
    await this.getInfo()
  }
}

/** Export store class as default export. */
export default RPC
