import { action, autorunAsync, computed, observable, reaction } from 'mobx'
import { notification } from 'antd'
import { readFileSync } from 'fs'
import { createServer } from 'net'
import { Client } from 'ssh2'
import { shortUid } from '../utilities/common'
import { getItem, setItem } from '../utilities/localStorage'
import i18next from '../utilities/i18next'

/** Required store instances. */
import gui from './gui'
import rates from './rates'

/** Store classes. */
import RPC from './rpc'
import RPCNext from './rpc_next'
import Send from './send'
import Stats from './stats'
import Wallet from './wallet'
import WalletNext from './wallet_next'

class Connections {
  /**
   * Observable properties.
   * @property {map} configs - Connections configs.
   * @property {boolean} modal - Connection manager modal status.
   * @property {string} viewing - Viewing connection uid.
   */
  @observable configs = observable.map(getItem('connections') || {})
  @observable modal = true
  @observable viewing = ''

  /**
   * @constructor
   * @property {map} stores - Active connections stores.
   * @property {map} tunnels - SSH tunnels instances.
   */
  constructor () {
    this.stores = new Map()
    this.tunnels = new Map()

    /**
     * Save updated connections to local storage every 3s while changes are
     * made to the properties (excluding password, private key and status).
     */
    autorunAsync(() => {
      let connections = {}

      this.configs.forEach((conn, uid) => {
        connections[uid] = {
          uid: conn.uid,
          type: conn.type,
          username: conn.username,
          password: '',
          privateKey: '',
          host: conn.host,
          port: conn.port,
          dstPort: conn.dstPort,
          localPort: conn.localPort,
          status: { active: false, rpc: null, tunnel: null }
        }
      })

      /** Save updated connections to local storage. */
      setItem('connections', connections)
    }, 3 * 1000)

    /** Always have one connection available and perform auto-start. */
    reaction(
      () => this.configs.size,
      size => {
        if (size === 0) {
          this.add()
        }

        /**
         * Auto-start the first connection if it's local or the viewing
         * connection if it's first in this.uids.
         */
        if (
          size > 0 &&
          (this.viewing === '' || this.viewing === this.uids[0])
        ) {
          const conn = this.configs.get(this.uids[0])

          if (conn.status.active === false) {
            /** Set viewing if none has been set so far. */
            if (this.viewing === '') {
              this.setViewing(this.uids[0])
            }

            /** Start the connection if it's local. */
            if (conn.type === 'local') {
              setTimeout(() => this.start(), 0.1 * 1000)
            }
          }
        }
      },
      true
    )

    /** React to Alt-asd key presses. */
    document.addEventListener(
      'keydown',
      e => {
        if (e.altKey === true) {
          /** Alt-ad: Switch between previous and next connection. */
          if (e.keyCode === 65 || e.keyCode === 68) {
            const length = this.uids.length

            if (length > 1) {
              const index = this.uids.indexOf(this.viewing)

              /** Alt-a: Move to the left. */
              if (e.keyCode === 65) {
                /** Return to the end if we hit the beginning. */
                if (index === 0) {
                  this.setViewing(this.uids[length - 1])
                } else {
                  this.setViewing(this.uids[index - 1])
                }
              }

              /** Alt-d: Move to the right. */
              if (e.keyCode === 68) {
                /** Return to the beginning if we hit the end. */
                if (index + 1 === length) {
                  this.setViewing(this.uids[0])
                } else {
                  this.setViewing(this.uids[index + 1])
                }
              }
            }
          }

          /** Alt-s: Toggle connection manager. */
          if (e.keyCode === 83) {
            this.toggleModal()
          }
        }
      },
      false
    )
  }

  /**
   * Get current connection's start button status.
   * @function startStatus
   * @return {boolean} Start button status.
   */
  @computed
  get startStatus () {
    if (this.configs.has(this.viewing) === true) {
      const conn = this.configs.get(this.viewing)

      switch (conn.type) {
        case 'ssh':
          if (conn.localPort === '') return false
          if (conn.dstPort === '') return false
          if (conn.host === '') return false
          if (conn.port === '') return false
          if (conn.username === '') return false
          if (conn.password === '' && conn.privateKey === '') return false
          return true

        default:
          if (conn.localPort === '') return false
          return true
      }
    }

    return false
  }

  /**
   * Get connections uids.
   * @function uids
   * @return {array} Connections uids.
   */
  @computed
  get uids () {
    return [...this.configs.keys()]
  }

  /**
   * Get stores of the connection being viewed.
   * @function viewingStores
   * @return {object|null} Stores or null if none.
   */
  @computed
  get viewingStores () {
    if (this.stores.has(this.viewing) === false) return null
    return this.stores.get(this.viewing)
  }

  /**
   * Add new connection.
   * @function add
   */
  @action
  add () {
    const uid = shortUid()

    this.configs.set(uid, {
      uid,
      type: 'local',
      username: '',
      password: '',
      privateKey: '',
      host: '',
      port: 22,
      dstPort: 9195,
      localPort: 9195 + this.configs.size,
      status: { active: false, rpc: null, tunnel: null }
    })

    /** Switch to the added connection. */
    this.setViewing(uid)
  }

  /**
   * Remove the viewing connection.
   * @function remove
   */
  @action
  remove () {
    const index = this.uids.indexOf(this.viewing)
    const length = this.uids.length

    /** Stop the connection and remove it's stores. */
    this.stop(this.viewing)
    this.configs.delete(this.viewing)
    this.stores.delete(this.viewing)

    /**
     * Switch to the next last connection if removing the last, or switch
     * to the next connection with the same index as the one we're removing.
     */
    if (index + 1 === length) {
      this.setViewing(this.uids[index - 1])
    } else {
      this.setViewing(this.uids[index])
    }
  }

  /**
   * Set viewing connection property.
   * @function setConfig
   * @param {string} key - Object key to alter.
   * @param {any} value - Value to assign.
   */
  @action
  setConfig (key, value) {
    const conn = this.configs.get(this.viewing)

    /** Handle port inputs. Allow only numbers below 65536. */
    const ports = ['dstPort', 'localPort', 'port']

    if (ports.includes(key) === true && value !== '') {
      if (value.match(/^\d+$/) === null || parseInt(value) > 65535) return
    }

    conn[key] = value
  }

  /**
   * Set connection status.
   * @function setStatus
   * @param {string} uid - Connection uid.
   * @param {object} status - Updated connection status.
   */
  @action.bound
  setStatus (uid, status) {
    const conn = this.configs.get(uid)
    conn.status = { ...conn.status, ...status }
  }

  /**
   * Set viewing connection.
   * @function setViewing
   * @param {string} uid - Connection uid.
   */
  @action
  setViewing (uid) {
    this.viewing = uid
  }

  /**
   * Toggle modal's visibility.
   * @function toggleModal
   */
  @action
  toggleModal () {
    this.modal = !this.modal
  }

  /**
   * Start the viewing connection.
   * @function start
   */
  start (uid = this.viewing) {
    const conn = this.configs.get(uid)

    /** Initialize and set the new connection's stores. */
    if (this.stores.has(uid) === false) {
      const rpc = new RPC(conn, this.setStatus)
      const rpcNext = new RPCNext(conn, this.setStatus)
      const wallet = new Wallet(gui, rates, rpc)
      const walletNext = new WalletNext(gui, rates, rpcNext)
      const send = new Send(rpc, wallet)
      const stats = new Stats(rpc, wallet)

      this.stores.set(uid, { rpc, rpcNext, send, stats, wallet, walletNext })
    }

    /** Set connection active. */
    this.setStatus(uid, { active: true })

    /** Setup a SSH tunnel. */
    if (conn.type === 'ssh') {
      /** Create a new SSH client. */
      const ssh = new Client()

      /** Connect to the SSH server. */
      ssh.connect({
        host: conn.host,
        port: conn.port,
        username: conn.username,
        password: conn.password,
        passphrase: conn.password,
        privateKey: conn.privateKey === '' ? '' : readFileSync(conn.privateKey)
      })

      /** Emit SSH errors to the server. */
      ssh.on('error', error => server.emit('error', error))

      /** Set tunnel active on SSH connection ready. */
      ssh.on('ready', () => this.setStatus(uid, { tunnel: true }))

      /** Create a new server. */
      const server = createServer(socket => {
        /** End sockets as they close or error out. */
        socket.on('close', () => socket.end())
        socket.on('error', () => socket.end())

        /** Forward HTTP requests over SSH connection to the remote node. */
        ssh.forwardOut(
          '127.0.0.1',
          conn.localPort,
          '127.0.0.1',
          conn.dstPort,
          (error, stream) => {
            /** Return and emit forwarding errors to the server. */
            if (typeof error !== 'undefined') return server.emit('error', error)

            /** Emit stream errors to the server. */
            stream.on('error', error => server.emit('error', error))

            /** Pipe SSH stream to the socket. */
            socket.pipe(stream).pipe(socket)
          }
        )
      }).listen(conn.localPort, '127.0.0.1')

      /** Stop tunnel on error. */
      server.on('error', error => {
        /** Display a notification with the error message. */
        notification.error({
          message: ''.concat(i18next.t('wallet:connection'), ' ', conn.host),
          description: error.message,
          duration: 0
        })

        this.stopTunnel(uid)
        this.setStatus(uid, { tunnel: false })
      })

      /** Save tunnel. */
      this.tunnels.set(uid, { ssh, server })
    }
  }

  /**
   * Stop the viewing connection and reset it's status.
   * @function stop
   */
  stop () {
    this.stopTunnel(this.viewing)
    this.setStatus(this.viewing, { active: false, rpc: null, tunnel: null })
  }

  /**
   * Stop and delete the tunnel.
   * @function stopTunnel
   * @param {string} uid - Connection uid.
   */
  stopTunnel (uid) {
    if (this.tunnels.has(uid) === true) {
      const tunnel = this.tunnels.get(uid)

      /** Close the server & stop and delete the SSH tunnel. */
      tunnel.server.close()
      tunnel.ssh.end()
      this.tunnels.delete(uid)
    }
  }
}

/** Initialize a new globally used store. */
const connections = new Connections()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default connections
export { Connections }
