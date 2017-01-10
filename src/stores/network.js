import { action, autorunAsync, computed, observable, reaction } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'
import geoIp from '../utilities/geoIp'

/** Required store instances. */
import rpc from './rpc'

class Network {
  /**
   * Observable properties.
   * @property {object} networkInfo - getnetworkinfo RPC response.
   * @property {array} peerInfo - getpeerinfo RPC response.
   * @property {map} geoData - IP lookup data.
   */
  @observable networkInfo = {}
  @observable peerInfo = []
  @observable geoData = observable.map(getItem('geoData') || {})

  /**
   * @constructor
   * @property {number|null} loopTimeout - setTimeout id of this.loop().
   */
  constructor () {
    this.loopTimeout = null

    /** When RPC status changes. */
    reaction(() => rpc.status, (status) => {
      /** Clear previous this.loop() setTimeout. */
      if (this.loopTimeout !== null) this.clearLoopTimeout()

      /** Start update loop when RPC becomes available. */
      if (status === true) this.loop()
    })

    /** Fetch missing IP geo data (with a 2s delay) on RPC update. */
    autorunAsync(() => {
      const nodes = [...this.peers, ...this.endpoints]
      let lookupCount = 0
      let promises = []

      /** Fetch in batches of 10 or less. */
      for (let i = 0; i < nodes.length; i++) {
        if (lookupCount >= 10) break

        /** Very loosely check if IPv4. */
        if (nodes[i].ip.match('\\.') !== null) {
          /** Check if geo data already exists. */
          if (this.geoData.has(nodes[i].ip) === false) {
            /** Push new promise to the promises array. */
            promises.push(new Promise((resolve, reject) => {
              /** Execute the promise with a 0.5s delay. */
              setTimeout(() => {
                geoIp(nodes[i].ip, (response) => {
                  if (response !== null) {
                    console.info('HTTPS: Geo IP lookup for ' + nodes[i].ip)
                    resolve(response)
                  } else {
                    reject(nodes[i].ip)
                  }
                })
              }, lookupCount * 500)
            }))

            lookupCount += 1
          }
        }
      }

      if (promises.length > 0) {
        Promise.all(promises)
          .then(response => { this.setGeoData(response) })
          .catch(error => { console.error('GeoIP: Promises error.', error) })
      }
    }, 2 * 1000)
  }

  /**
   * Get tcp connection count.
   * @function tcp
   * @return {number} TCP connections.
   */
  @computed get tcp () {
    if (this.networkInfo.hasOwnProperty('tcp') === true) {
      return this.networkInfo.tcp.connections
    }

    return 0
  }

  /**
   * Get udp connection count.
   * @function udp
   * @return {number} UDP connections.
   */
  @computed get udp () {
    if (this.networkInfo.hasOwnProperty('udp') === true) {
      return this.networkInfo.udp.connections
    }

    return 0
  }

  /**
   * Get array of peers with available geo data.
   * @function peers
   * @return {array} Peers.
   */
  @computed get peers () {
    if (this.peerInfo.length > 0) {
      return this.peerInfo.reduce((peers, item) => {
        if (item.lastsend !== 0 && item.startingheight !== -1) {
          let peer = {
            ...item,
            ip: item.addr.split(':')[0],
            lastsend: item.lastsend * 1000,
            lastrecv: item.lastrecv * 1000,
            conntime: item.conntime * 1000,
            version: item.subver.match(/\/(.*)\(/).pop().replace(':', ' '),
            os: item.subver.split(' ')[1].replace(')/', '')
          }

          if (this.geoData.has(peer.ip) === true) {
            peer = {
              ...peer,
              ...this.geoData.get(peer.ip)
            }
          }
          peers.push(peer)
        }

        return peers
      }, [])
    }

    return []
  }

  /**
   * Get array of endpoints with available geo data.
   * @function endpoints
   * @return {array} Endpoints.
   */
  @computed get endpoints () {
    if (this.networkInfo.hasOwnProperty('endpoints') === true) {
      return this.networkInfo.endpoints.reduce((endpoints, item) => {
        let endpoint = {
          addr: item,
          ip: item.split(':')[0]
        }

        if (this.geoData.has(endpoint.ip) === true) {
          endpoint = {
            ...endpoint,
            ...this.geoData.get(endpoint.ip)
          }
        }

        endpoints.push(endpoint)
        return endpoints
      }, [])
    }

    return []
  }

  /**
   * Get counts of known endpoints grouped by country.
   * @function byCountry
   * @return {array} Known endpoints counts grouped by country.
   */
  @computed get byCountry () {
    const countries = this.endpoints.reduce((countries, item) => {
      if (item.hasOwnProperty('country') === true) {
        const prev = countries.has(item.country) === true
          ? countries.get(item.country)
          : 0

        countries.set(item.country, {
          country: item.country,
          count: prev === 0 ? 1 : prev.count + 1
        })
      }

      return countries
    }, new Map())

    return [...countries.values()].sort((a, b) => {
      if (a.count > b.count) return -1
      if (a.count < b.count) return 1
      return 0
    })
  }

  /**
   * Get number of known endpoints.
   * @function knownEndpoints
   * @return {number} Known endpoints.
   */
  @computed get knownEndpoints () {
    if (this.networkInfo.hasOwnProperty('endpoints') === true) {
      return this.networkInfo.endpoints.length
    }

    return 0
  }

  /**
   * Set geo IP lookups response.
   * @function setGeoData
   * @param {array} response - Geo IP lookups promises response.
   */
  @action setGeoData (response) {
    response.forEach((lookup) => {
      if (lookup.hasOwnProperty('country') === true) {
        if (lookup.country.name !== '') {
          this.geoData.set(lookup.ip, {
            country: lookup.country.name,
            lon: lookup.location.longitude,
            lat: lookup.location.latitude
          })
        }
      }
    })

    /** Save updated geo data to local storage. */
    const geoData = this.geoData.toJS()
    setItem('geoData', geoData)
  }

  /**
   * Set RPC response.
   * @function setResponse
   * @param {array} networkInfo - getnetworkinfo result.
   * @param {array} peerInfo - getpeerinfo result.
   */
  @action setResponse (networkInfo, peerInfo) {
    this.networkInfo = networkInfo
    this.peerInfo = peerInfo
  }

  /**
   * Clear current loop timeout.
   * @function clearLoop
   */
  @action clearLoopTimeout () {
    clearTimeout(this.loopTimeout)
    this.loopTimeout = null
  }

  /**
   * Start new loop timeout and save its id.
   * @function setLoopTimeout
   */
  @action setLoopTimeout () {
    this.loopTimeout = setTimeout(() => {
      this.loop()
    }, 60 * 1000)
  }

  /**
   * Get network info.
   * @function loop
   */
  loop () {
    rpc.call([
      {
        method: 'getnetworkinfo',
        params: []
      },
      {
        method: 'getpeerinfo',
        params: []
      }
    ], (response) => {
      if (response !== null) {
        /** Start new loop. */
        this.setLoopTimeout()

        /** Set the response. */
        this.setResponse(response[0].result, response[1].result)
      }
    })
  }
}

/** Initialize a new globally used store. */
const network = new Network()

/**
 * Export initialized store as default export,
 * and store class as named export.
 */
export default network
export { Network }
