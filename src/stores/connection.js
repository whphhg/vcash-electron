import { action, computed, extendObservable } from 'mobx'
import { readFileSync } from 'fs'
import { createServer } from 'net'
import { Client } from 'ssh2'
import { shortUid } from '../utilities/common.js'
import i18next from '../utilities/i18next.js'

/** Ant Design */
import notification from 'antd/lib/notification'

/** Store instances */
import gui from './gui.js'
import rates from './rates.js'

/** Store classes */
import Console from './console.js'
import RPC from './rpc.js'
import Search from './search.js'
import Send from './send.js'
import Statistics from './statistics.js'
import Wallet from './wallet.js'

class Connection {
  /**
   * @param {object} saved - Config read from local storage (optional).
   * @prop {object} stores - Data stores.
   * @prop {object} tunnel - Server and SSH tunnel instances.
   * @prop {string} id - Connection ID.
   * @prop {string} type - Connection type (local or SSH).
   * @prop {string} username - SSH username.
   * @prop {string} passphrase - SSH passphrase.
   * @prop {string} privateKey - SSH private key.
   * @prop {string} host - SSH host.
   * @prop {number} port - SSH port.
   * @prop {number} dstPort - Remote RPC port.
   * @prop {number} localPort - Local RPC port.
   * @prop {object} status - Connection active, rpc and tunnel status.
   */
  constructor(saved = {}) {
    this.stores = {}
    this.tunnel = {}

    /** Extend the store with observable properties. */
    extendObservable(this, {
      id: shortUid(),
      type: 'local',
      username: '',
      passphrase: '',
      privateKey: '',
      host: '',
      port: 22,
      dstPort: 9195,
      localPort: 9195,
      status: { active: false, rpc: null, tunnel: null },
      ...saved
    })
  }

  /**
   * Get connection config.
   * @function config
   * @return {object} Connection config.
   */
  @computed
  get config() {
    return {
      id: this.id,
      type: this.type,
      username: this.username,
      host: this.host,
      port: this.port,
      dstPort: this.dstPort,
      localPort: this.localPort
    }
  }

  /**
   * Get start button status.
   * @function startStatus
   * @return {boolean} Start status.
   */
  @computed
  get startStatus() {
    switch (this.type) {
      case 'ssh':
        if (this.localPort === '') return false
        if (this.dstPort === '') return false
        if (this.host === '') return false
        if (this.port === '') return false
        if (this.username === '') return false
        if (this.passphrase === '' && this.privateKey === '') return false
        return true

      default:
        if (this.localPort === '') return false
        return true
    }
  }

  /**
   * Set connection property.
   * @function setProp
   * @param {string} key - Object key to alter.
   * @param {any} value - Value to assign.
   */
  @action
  setProp(key, value) {
    const ports = ['dstPort', 'localPort', 'port']

    /** For ports, allow only numbers below 65536. */
    if (ports.includes(key) === true && value !== '') {
      if (value.match(/^\d+$/) === null || parseInt(value) > 65535) return
    }

    this[key] = value
  }

  /**
   * Update connection status.
   * @function setStatus
   * @param {object} status - Updated status.
   */
  @action
  setStatus = status => {
    Object.keys(status).forEach(key => (this.status[key] = status[key]))
  }

  /**
   * Start the connection.
   * @function start
   */
  start() {
    /** Initialize and set new stores. */
    if (Object.keys(this.stores).length === 0) {
      const rpc = new RPC(this)
      const wallet = new Wallet(gui, rates, rpc)
      const send = new Send(gui, rpc, wallet)

      this.stores = {
        console: new Console(rpc),
        rpc,
        search: new Search(gui, rates, send, wallet),
        send,
        statistics: new Statistics(rpc, wallet),
        wallet
      }
    }

    /** Set connection active. */
    this.setStatus({ active: true })

    /** Start SSH tunnel. */
    if (this.type === 'ssh') this.startTunnel()
  }

  /**
   * Start the SSH tunnel.
   * @function startTunnel
   */
  startTunnel() {
    const ssh = new Client()

    /** Connect to the SSH server. */
    ssh.connect({
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.passphrase,
      passphrase: this.passphrase,
      privateKey: this.privateKey === '' ? '' : readFileSync(this.privateKey)
    })

    /** Emit SSH errors to the server. */
    ssh.on('error', error => server.emit('error', error))

    /** Set tunnel active on SSH connection ready. */
    ssh.on('ready', () => this.setStatus({ tunnel: true }))

    /** Create a new server. */
    const server = createServer(socket => {
      /** End sockets as they close or error out. */
      socket.on('close', () => socket.end())
      socket.on('error', () => socket.end())

      /** Forward HTTP requests over SSH connection to the remote node. */
      ssh.forwardOut(
        '127.0.0.1',
        this.localPort,
        '127.0.0.1',
        this.dstPort,
        (error, stream) => {
          /** Return and emit forwarding error to the server. */
          if (typeof error !== 'undefined') return server.emit('error', error)

          /** Emit stream errors to the server. */
          stream.on('error', error => server.emit('error', error))

          /** Pipe SSH stream to the socket. */
          socket.pipe(stream).pipe(socket)
        }
      )
    }).listen(this.localPort, '127.0.0.1')

    /** Stop tunnel on error. */
    server.on('error', error => {
      this.stopTunnel()

      /** Set SSH tunnel inactive. */
      this.setStatus({ tunnel: false })

      /** Display a non-expiring notification with the error message. */
      notification.error({
        message: ''.concat(i18next.t('connection'), ' ', this.host),
        description: error.message,
        duration: 0
      })
    })

    /** Set the server and SSH client. */
    this.tunnel = { server, ssh }
  }

  /**
   * Stop the connection and reset the status.
   * @function stop
   */
  stop() {
    /** Stop the SSH tunnel if active. */
    if (this.status.tunnel !== null) this.stopTunnel()

    /** Reset connection status. */
    this.setStatus({ active: false, rpc: null, tunnel: null })
  }

  /**
   * Stop and reset the SSH tunnel.
   * @function stopTunnel
   */
  stopTunnel() {
    /** Close the server sending RPC over SSH, and end the SSH client. */
    this.tunnel.server.close()
    this.tunnel.ssh.end()

    /** Reset the tunnel. */
    this.tunnel = { server: null, ssh: null }
  }
}

/** Export store class as default export. */
export default Connection
