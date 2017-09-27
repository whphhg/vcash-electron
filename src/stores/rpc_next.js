import { computed, reaction } from 'mobx'
import rpcs from '../utilities/rpcs'

class RPC {
  /**
   * @constructor
   * @param {object} conn - Connection's settings and status.
   * @param {function} setStatus - Set connection's status.
   * @property {array} methods - RPC methods names.
   * @property {number|null} testTimeout - testRPC() timeout id.
   */
  constructor (conn, setStatus) {
    this.conn = conn
    this.setStatus = setStatus
    this.methods = Object.keys(rpcs)
    this.testTimeout = null

    /** Assign camelCase named RPC methods as functions wrapping batch(). */
    Object.keys(rpcs).forEach(method => {
      this[rpcs[method]] = async function () {
        const response = await this.batch([{ method, params: [...arguments] }])
        return response
      }
    })

    /** Test RPC on local connection's start or clear testTimeout on stop. */
    reaction(
      () => this.conn.status.active,
      active => {
        if (active === true && this.conn.type === 'local') this.testRPC()
        if (active === false) clearTimeout(this.testTimeout)
      }
    )

    /** Test RPC on SSH tunnel ready. */
    reaction(
      () => this.conn.status.tunnel,
      tunnel => {
        if (tunnel === true) this.testRPC()
      }
    )
  }

  /**
   * Get RPC status.
   * @function ready
   * @return {boolean} RPC status.
   */
  @computed
  get ready () {
    if (this.conn.status.active === false) return false
    return this.conn.status.rpc
  }

  /**
   * Make a single or batch RPC request.
   * @function batch
   * @param {array} req - RPC method and params object(s).
   * @returns {object} Response(s) and request(s), single response, or empty.
   */
  async batch (req) {
    try {
      /** Add jsonrpc version and random id to each RPC in the request. */
      req.map(rpc => {
        rpc.jsonrpc = '2.0'
        rpc.id = Math.floor(Math.random() * 10000)
      })

      /** Serialize the RPC(s) and make the POST request. */
      const request = await window.fetch(
        'http://127.0.0.1:' + this.conn.localPort,
        {
          method: 'POST',
          body: JSON.stringify(req)
        }
      )

      /** Get the JSON response. */
      const res = await request.json()

      /** Toggle connection's RPC status if not true. */
      if (this.conn.status.rpc !== true) {
        this.setStatus(this.conn.uid, { rpc: true })
      }

      /** Return the responses and requests, or a single response. */
      if (req.length > 1) return { res, req }
      return res[0]
    } catch (error) {
      console.error('rpc.batch:', error.message)

      /** Reject invalid responses without altering the RPC status. */
      if (error.message.indexOf('Unexpected token') !== -1) return

      /** Toggle connection's RPC status if not false. */
      if (this.conn.status.rpc !== false || this.testTimeout === null) {
        this.setStatus(this.conn.uid, { rpc: false })
      }

      /** Test RPC every 5s until the daemon is reachable. */
      this.testTimeout = setTimeout(() => this.testRPC(), 5 * 1000)

      /** Return empty object on a failed request. */
      return {}
    }
  }

  /**
   * Test daemon's RPC reachability.
   * @function testRPC
   */
  async testRPC () {
    clearTimeout(this.testTimeout)
    await this.getInfo()
  }
}

export default RPC
