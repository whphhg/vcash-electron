import { action, autorunAsync, computed, observable, reaction } from 'mobx'
import { readFileSync } from 'fs'
import { createServer } from 'net'
import { Client } from 'ssh2'
import { shortUid } from '../utilities/common'
import { getItem, setItem } from '../utilities/localStorage'

/** Required stores. */
import gui from './gui'
import rates from './rates'

/** Store classes. */
import Info from './info'
import RPC from './rpc'
import Send from './send'
import Stats from './stats'
import Wallet from './wallet'

class Connections {
  /**
   * Observable properties.
   * @property {map} saved - Saved connections.
   * @property {string} viewing - Viewing connection uid.
   */
  @observable saved = observable.map(getItem('connections') || {})
  @observable viewing = ''

  /**
   * @constructor
   * @property {map} stores - Active connections stores.
   * @property {map} tunnels - SSH tunnels instances.
   */
  constructor () {
    this.stores = new Map()
    this.tunnels = new Map()

    /** Always have the initial local remote available. */
    reaction(() => this.saved.size, (size) => {
      if (size === 0) this.add()
    }, true)

    /**
     * Save updated connections to local storage every 5s while changes
     * are being made to the connection properties (excluding password,
     * private key and connection status).
     */
    autorunAsync(() => {
      let saved = {}

      this.saved.forEach((connection, uid) => {
        saved[uid] = {
          uid: connection.uid,
          type: connection.type,
          username: connection.username,
          password: '',
          privateKey: '',
          host: connection.host,
          port: connection.port,
          dstPort: connection.dstPort,
          localPort: connection.localPort,
          status: { active: false, rpc: null, tunnel: null }
        }
      })

      /** Save updated connections to local storage. */
      setItem('connections', saved)
    }, 5 * 1000)
  }

  /**
   * Get active connections uids.
   * @function active
   * @return {array} Active connections uids.
   */
  @computed get active () {
    return this.saved.values().reduce((active, connection) => {
      if (
        connection.status.active === true &&
        connection.status.rpc === true
      ) {
        active.push(connection.uid)
      }

      return active
    }, [])
  }

  /**
   * Get connections uids.
   * @function uids
   * @return {array} Connections uids.
   */
  @computed get uids () {
    return this.saved.values().reduce((uids, connection) => {
      uids.push(connection.uid)
      return uids
    }, [])
  }

  /**
   * Get stores of the connection being viewed.
   * @function viewingStores
   * @return {object|null} Stores or null if none.
   */
  @computed get viewingStores () {
    if (this.stores.has(this.viewing) === true) {
      return this.stores.get(this.viewing)
    }

    return null
  }

  /**
   * Add new connection.
   * @function add
   */
  @action add () {
    const uid = shortUid()

    this.saved.set(uid, {
      uid,
      type: 'local',
      username: '',
      password: '',
      privateKey: '',
      host: '',
      port: 22,
      dstPort: 9195,
      localPort: 9195 + this.saved.size,
      status: { active: false, rpc: null, tunnel: null }
    })
  }

  /**
   * Remove connection.
   * @function remove
   * @param {string} uid - Connection uid.
   */
  @action remove (uid) {
    /** Stop the connection before removing it. */
    this.stop(uid)

    /** Remove the connection and its stores. */
    this.saved.delete(uid)
    this.stores.delete(uid)
  }

  /**
   * Set connection property.
   * @function set
   * @param {string} uid - Connection uid.
   * @param {string} key - Object key to alter.
   * @param {any} value - Value to assign.
   */
  @action set (uid, key, value) {
    const connection = this.saved.get(uid)

    /** Handle port inputs. Allow only numbers below 65536. */
    if (key === 'port' || key === 'dstPort' || key === 'localPort') {
      if (value !== '') {
        if (value.match(/^\d+$/) === null || parseInt(value) > 65535) return
      }
    }

    connection[key] = value
  }

  /**
   * Set connection status.
   * @function setStatus
   * @param {string} uid - Connection uid.
   * @param {object} status - Updated connection status.
   */
  @action.bound setStatus (uid, status) {
    const connection = this.saved.get(uid)

    connection.status = {
      ...connection.status,
      ...status
    }

    /**
     * If the viewing connection goes down, reset this.viewing which will
     * also trigger a redirect to the welcome screen.
     */
    if (connection.status.rpc === false) {
      if (uid === this.viewing) this.setViewing()
    }
  }

  /**
   * Set viewing connection.
   * @function setViewing
   * @param {string} uid - Connection uid.
   */
  @action setViewing (uid = '') {
    this.viewing = uid
  }

  /**
   * Start connection.
   * @function start
   * @param {string} uid - Connection uid.
   */
  start (uid) {
    const conn = this.saved.get(uid)

    /** Initialize and set new connection stores. */
    if (this.stores.has(uid) === false) {
      const rpc = new RPC(conn, this.setStatus)
      const info = new Info(rpc)
      const wallet = new Wallet(gui, rates, rpc)
      const send = new Send(info, rpc, wallet)
      const stats = new Stats(info, rpc, wallet)

      this.stores.set(uid, { info, rpc, send, stats, wallet })
    }

    /** Set connection active. */
    this.setStatus(uid, { active: true })

    /** Setup a SSH tunnel. */
    if (conn.type === 'ssh') {
      let config = {
        host: conn.host,
        port: conn.port,
        username: conn.username,
        password: conn.password,
        privateKey: conn.privateKey === ''
          ? ''
          : readFileSync(conn.privateKey)
      }

      /** Add encrypted private key passphrase. */
      if (conn.privateKey !== '') config['passphrase'] = conn.password

      /** Create a new SSH client. */
      const ssh = new Client()

      /** Connect to the SSH server. */
      ssh.connect(config)

      /** Emit SSH errors to the server. */
      ssh.on('error', (error) => server.emit('error', error))

      /** Set tunnel active on SSH connection ready. */
      ssh.on('ready', () => this.setStatus(uid, { tunnel: true }))

      /** Create a new server. */
      const server = createServer((socket) => {
        /** End sockets as they close or error out. */
        socket.on('close', () => { socket.end() })
        socket.on('error', () => { socket.end() })

        /** Forward HTTP requests over SSH connection to the remote node. */
        ssh.forwardOut('127.0.0.1', conn.localPort, '127.0.0.1', conn.dstPort,
          (error, stream) => {
            /** Return and emit forwarding errors to the server. */
            if (typeof error !== 'undefined') return server.emit('error', error)

            /** Emit stream errors to the server. */
            stream.on('error', (error) => server.emit('error', error))

            /** Pipe SSH stream to the socket. */
            socket.pipe(stream).pipe(socket)
          }
        )
      }).listen(conn.localPort, '127.0.0.1')

      /** Stop tunnel on error. */
      server.on('error', (error) => {
        console.error(error)
        this.stopTunnel(uid)
        this.setStatus(uid, { tunnel: false })
      })

      /** Save tunnel. */
      this.tunnels.set(uid, { ssh, server })
    }
  }

  /**
   * Stop connection.
   * @function stop
   * @param {string} uid - Connection uid.
   */
  stop (uid) {
    /** Redirect to the welcome screen if stopping the viewing connection. */
    if (uid === this.viewing) this.setViewing()

    /** Stop tunnel. */
    this.stopTunnel(uid)

    /** Reset connection status. */
    this.setStatus(uid, { active: false, rpc: null, tunnel: null })
  }

  /**
   * Stop and delete the tunnel.
   * @function stopTunnel
   * @param {string} uid - Connection uid.
   */
  stopTunnel (uid) {
    if (this.tunnels.has(uid) === true) {
      const tunnel = this.tunnels.get(uid)
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
