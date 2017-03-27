import { action, computed, observable, reaction } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'

class RPC {
  /**
   * Observable properties.
   * @property {string} enteredPort - User entered RPC port.
   * @property {boolean} reachable - Daemon connectivity status.
   * @property {boolean} started - Start button status.
   */
  @observable enteredPort = getItem('rpcPort') || ''
  @observable reachable = false
  @observable started = false

  /**
   * @constructor
   * @property {number|null} testTimeout - testExecute() timeout id.
   */
  constructor () {
    this.testTimeout = null

    /** Test execute() on start-up. */
    reaction(() => this.started, (started) => {
      if (started === false) this.testExecute()
    }, true)

    /** Test execute() on port change if previously reachable. */
    reaction(() => this.enteredPort, (enteredPort) => {
      if (this.reachable === true) this.testExecute()
    })
  }

  /**
   * Get RPC port.
   * @function port
   * @return {string} RPC port.
   */
  @computed get port () {
    if (this.enteredPort === '') return '9195'
    return this.enteredPort
  }

  /**
   * Flag for UI to know when to begin and stop updating data.
   * @function ready
   * @return {boolean} Ready status.
   */
  @computed get ready () {
    if (this.reachable === false) return false
    return this.started
  }

  /**
   * Set RPC port.
   * @function setPort
   * @param {number} port - Port.
   */
  @action setPort (port = '') {
    if (port !== '') {
      /** Allow only numbers below 65536. */
      if (port.match(/^\d+$/) === null || parseInt(port) > 65535) return
    }

    /** Save port that passed above checks. */
    this.enteredPort = port

    /** Save to local storage. */
    setItem('rpcPort', port)
  }

  /**
   * Set reachable.
   * @function setReachable
   * @param {boolean} reachable - Reachable.
   */
  @action setReachable (reachable) {
    this.reachable = reachable
  }

  /**
   * Set started.
   * @function setStarted
   */
  @action setStarted () {
    this.started = true
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
      .fetch('http://127.0.0.1:' + this.port, {
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
        if (this.reachable === false) this.setReachable(true)
        return callback(data, options)
      })
      .catch((error) => {
        if (this.reachable === true) this.setReachable(false)

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

/** Initialize a new globally used store. */
const rpc = new RPC()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default rpc
export { RPC }
