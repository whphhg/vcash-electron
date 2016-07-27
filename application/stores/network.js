import { action, computed, observable } from 'mobx'
import { getItem, setItem } from '../utilities/localStorage'
import rpc from '../utilities/rpc'
import geoIp from '../utilities/geoIp'

/** Network store class. */
class Network {
  @observable ip
  @observable port
  @observable tcp
  @observable udp
  @observable connectedNodes
  @observable endpoints
  @observable geoData
  @observable incentive

  /**
   * Prepare observable variables and run RPC info functions.
   * @constructor
   * @property {string} ip - Wallet IP.
   * @property {number} port - Wallet port.
   * @property {number} tcp - TCP connections.
   * @property {number} udp - UDP connections.
   * @property {array} connectedNodes - Connected nodes
   * @property {array} endpoints - All known endpoints.
   * @property {object} geoData - IP lookup data.
   * @property {object} incentive - Incentive data.
   * @property {string} incentive.walletaddress - Primary wallet address.
   * @property {number} incentive.collateralrequired - Required collateral amount.
   * @property {number} incentive.collateralbalance - Collateral balance.
   * @property {string} incentive.networkstatus - Shows if your port is open.
   * @property {boolean} incentive.votecandidate - Shows if you're a vote candidate.
   */
  constructor() {
    this.ip = ''
    this.port = 0
    this.tcp = 0
    this.udp = 0
    this.connectedNodes = []
    this.endpoints = []
    this.geoData = getItem('geoData') || {}
    this.incentive = {
      walletaddress: '',
      collateralrequired: 0,
      collateralbalance: 0,
      networkstatus: 'firewalled',
      votecandidate: false
    }

    this.incentiveInfo()
    this.networkInfo()
  }

  /**
   * Set incentive info.
   * @function setIncentiveInfo
   * @param {object} info - New incentive info.
   */
  @action setIncentiveInfo(info) {
    for (let i in info) {
      if (this.incentive.hasOwnProperty(i)) {
        if (this.incentive[i] !== info[i]) {
          this.incentive[i] = info[i]
        }
      }
    }
  }

  /**
   * Set network info.
   * @function setNetworkInfo
   * @param {object} info - New network info.
   */
  @action setNetworkInfo(info) {
    for (let i in info) {
      if (this.hasOwnProperty(i)) {
        if (this[i] !== info[i]) {
          this[i] = info[i]
        }
      }
    }
  }

  /**
   * Set nodes and geo data info.
   * @function setNodes
   * @param {array} connectedNodes - New connected nodes info.
   * @param {array} endpoints - New endpoints info.
   * @param {object} geoData - Geodata lookups.
   */
  @action setNodes(connectedNodes, endpoints, geoData) {
    this.connectedNodes = connectedNodes
    this.endpoints = endpoints

    if (Object.keys(geoData).length > 0) {
      this.geoData = {
        ...this.geoData,
        ...geoData
      }

      /** Write new geoData to localStorage. */
      setItem('geoData', {
        ...this.geoData,
        ...geoData
      })
    }
  }

  /**
   * Get unique endpoint locations.
   * @function uniqueEndpointLocations
   * @return {array} Unique endpoint locations.
   */
  @computed get uniqueEndpointLocations() {
    /** Add connected nodes locations to the uniqueLocations array. */
    let uniqueLocations = this.connectedNodes.reduce((uniqueLocations, node) => {
      if (node.lat && node.lon) {
        uniqueLocations.push({
          lat: node.lat,
          lon: node.lon
        })
      }

      return uniqueLocations
    }, [])

    /** Add endpoints with unique location to the uniqueEndpoints array. */
    const uniqueEndpoints = this.endpoints.reduce((uniqueEndpoints, endpoint) => {
      if (endpoint.lat && endpoint.lon) {
        for (let i in uniqueLocations) {
          if (uniqueLocations[i].lat === endpoint.lat && uniqueLocations[i].lon === endpoint.lon) {
            return uniqueEndpoints
          }
        }

        uniqueEndpoints.push(endpoint)
        uniqueLocations.push({
          lat: endpoint.lat,
          lon: endpoint.lon
        })
      }

      return uniqueEndpoints
    }, [])

    return uniqueEndpoints
  }

  /**
   * Get incentive info.
   * @function incentiveInfo
   */
  incentiveInfo() {
    rpc({ method: 'getincentiveinfo', params: [] }, (response) => {
      if (response !== null) {
        this.setIncentiveInfo(response.result)
      }

      setTimeout(() => { this.incentiveInfo() }, 45 * 1000)
    })
  }

  /**
   * Get network info.
   * @function networkInfo
   */
  networkInfo() {
    rpc([{ method: 'getpeerinfo', params: [] }, { method: 'getnetworkinfo', params: [] }], (response) => {
      if (response === null) {
        return setTimeout(() => { this.networkInfo() }, 10 * 1000)
      }

      this.setNetworkInfo({
        ip: response[1].result.tcp.ip || response[1].result.udp.ip,
        port: response[1].result.tcp.port || response[1].result.udp.port,
        tcp: response[1].result.tcp.connections,
        udp: response[1].result.udp.connections
      })

      let promises = []
      let lookups = []

      let connectedNodes = response[0].result.reduce((nodes, peer) => {
        /** Filter out dropped connections. */
        if (parseInt(peer.lastsend) !== 0) {
          const ip = peer.addr.split(':')[0]
          const index = response[1].result.endpoints.indexOf(peer.addr)

          /** Remove connected node from endpoints array. */
          if (index > -1) response[1].result.endpoints.splice(index, 1)

          if (!this.geoData[ip]) lookups.push(ip)
          nodes.push(peer)
        }

        return nodes
      }, [])

      let endpoints = response[1].result.endpoints.reduce((endpoints, endpoint) => {
        const ip = endpoint.split(':')[0]

        if (ip.length > 0) {
          if (!this.geoData[ip]) lookups.push(ip)
          endpoints.push({ addr: endpoint })
        }

        return endpoints
      }, [])

      lookups.map((ip, i) => {
        promises.push(new Promise((resolve, reject) => {
          setTimeout(() => {
            geoIp(ip, (response) => {
              if (response !== null) {
                process.env.NODE_ENV === 'dev' && console.info('HTTPS: GeoIp lookup', ip, '('+i+').')
                resolve(response)
              } else {
                reject('')
              }
            })
          }, i * 400)
        }))
      })

      Promise.all(promises)
        .then((geoData) => {
          geoData = geoData.reduce((geoData, data) => {
            geoData[data.ip] = {
              country: data.country.name,
              lon: data.location.longitude,
              lat: data.location.latitude
            }

            return geoData
          }, {})

          /** Combine geoData from current lookups and state. */
          const combinedGeoData = {
            ...this.geoData,
            ...geoData
          }

          connectedNodes.map((peer) => {
            const ip = peer.addr.split(':')[0]

            /** Convert to miliseconds. */
            peer.lastsend *= 1000
            peer.lastrecv *= 1000
            peer.conntime *= 1000

            const subver = peer.subver.replace('/', '').replace('/', '').replace(':',' ').replace(')', '').split('(Peer; ')

            peer.subverClean = subver[0]
            peer.os = subver[1]

            if (combinedGeoData[ip]) {
              peer.country = combinedGeoData[ip].country
              peer.lat = combinedGeoData[ip].lat
              peer.lon = combinedGeoData[ip].lon
            }
          })

          endpoints.map((peer) => {
            const ip = peer.addr.split(':')[0]

            if (combinedGeoData[ip]) {
              peer.country = combinedGeoData[ip].country
              peer.lat = combinedGeoData[ip].lat
              peer.lon = combinedGeoData[ip].lon
            }
          })

          this.setNodes(connectedNodes, endpoints, geoData)
          setTimeout(() => { this.networkInfo() }, 60 * 1000)
        },
        (error) => {
          process.env.NODE_ENV === 'dev' && console.error('RPC: Network geo ip lookups promises error.', error)
        }
      )
    })
  }
}

const network = new Network()

export default network
export { Network }
