import { action, computed, extendObservable, reaction } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage.js'

/** Store classes */
import Connection from './connection.js'

class Connections {
  /**
   * @prop {map} instances - Connection instances.
   * @prop {array} ids - Connection IDs in the instance order.
   * @prop {string} viewingId - Viewing connection ID.
   */
  constructor() {
    this.instances = new Map()

    /** Get connection configs saved in local storage. */
    let saved = getItem('connections')

    /** TODO: Remove in a future release. */
    Object.keys(saved).forEach(id => {
      if ('uid' in saved[id] === false) return

      /** Replace uid with id, which was used prior to v0.33.17. */
      saved[id].id = saved[id].uid
      delete saved[id].uid
    })

    /** Extend the store with observable properties. */
    extendObservable(this, {
      ids:
        typeof saved === 'undefined'
          ? []
          : Object.keys(saved).reduce((ids, connection) => {
              /** Initialize saved connection instances and set IDs. */
              this.instances.set(connection, new Connection(saved[connection]))
              ids.push(connection)
              return ids
            }, []),
      viewingId:
        typeof saved === 'undefined' ? '' : this.instances.keys().next().value
    })

    /** Add and auto-start new connection if there are no saved configs. */
    if (this.ids.length === 0) {
      this.add()
      this.instances.get(this.ids[0]).start()
    } else {
      /** Auto-start the first local connection if there are saved configs. */
      for (let instance of this.instances.values()) {
        if (instance.type === 'local') {
          this.setViewing(instance.id)
          instance.start()
          break
        }
      }
    }

    /** Always have one connection available. */
    reaction(
      () => this.ids.length,
      connections => {
        if (connections === 0) this.add()
      },
      {
        fireImmediately: true,
        name: 'Connections: checking if at least one connection is available.'
      }
    )

    /** Auto-save updated connection configs to local storage with 3s delay. */
    reaction(
      () => {
        return this.ids.reduce((connections, id) => {
          connections[id] = this.instances.get(id).config
          return connections
        }, {})
      },
      connections => setItem('connections', connections),
      {
        delay: 3 * 1000,
        name: 'Connections: auto-saving updated configs to local storage.'
      }
    )
  }

  /**
   * Get the instance of the viewing connection.
   * @function viewing
   * @return {object} Viewing connection instance.
   */
  @computed
  get viewing() {
    return this.instances.get(this.viewingId)
  }

  /**
   * Add new connection.
   * @function add
   */
  @action
  add() {
    const connection = new Connection()

    /** Set the new connection instance and ID. */
    this.instances.set(connection.id, connection)
    this.ids.push(connection.id)

    /** Change view to the new connection. */
    this.setViewing(connection.id)
  }

  /**
   * Remove viewing connection.
   * @function remove
   */
  @action
  remove() {
    const index = this.ids.indexOf(this.viewingId)
    const length = this.ids.length

    /** Stop the connection (and SSH tunnel). */
    this.instances.get(this.viewingId).stop()

    /** Remove the connection instance and ID. */
    this.instances.delete(this.viewingId)
    this.ids.remove(this.viewingId)

    /** Exit if there are no more connections. */
    if (this.ids.length === 0) return

    /**
     * Switch to the next last connection if removing the last, or switch
     * to the next connection with the same index as the one we're removing.
     */
    if (index + 1 === length) {
      this.setViewing(this.ids[index - 1])
    } else {
      this.setViewing(this.ids[index])
    }
  }

  /**
   * Set viewing connection.
   * @function setViewing
   * @param {string} id - Connection ID.
   */
  @action
  setViewing(id) {
    this.viewingId = id
  }
}

/** Initialize a new globally used store. */
const connections = new Connections()

/** Export initialized store as default export & store class as named export. */
export default connections
export { Connections }
