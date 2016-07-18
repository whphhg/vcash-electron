import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import geoIp from '../utilities/geoIp'

export const networkInfo = () => {
  return (dispatch, getState) => {
    const options = [
      { method: 'getpeerinfo', params: [] },
      { method: 'getnetworkinfo', params: [] }
    ]

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        let lookups = []
        let promises = []
        let network = {
          ip: response[1].result.tcp.ip || response[1].result.udp.ip,
          port: response[1].result.tcp.port || response[1].result.udp.port,
          tcp: response[1].result.tcp.connections,
          udp: response[1].result.udp.connections,
          nodes: {
            connected: [],
            endpoints: [],
            geoData: {}
          }
        }

        network.nodes.connected = response[0].result.reduce((nodes, peer) => {
          // Filter out dropped connections.
          if (parseInt(peer.lastsend) !== 0) {
            const ip = peer.addr.split(':')[0]
            const index = response[1].result.endpoints.indexOf(peer.addr)

            // Remove connected node from endpoints array.
            if (index > -1) {
              response[1].result.endpoints.splice(index, 1)
            }

            if (!getState().network.nodes.geoData[ip]) {
              lookups.push(ip)
            }

            nodes.push(peer)
          }

          return nodes
        }, [])

        network.nodes.endpoints = response[1].result.endpoints.reduce((endpoints, endpoint) => {
          const ip = endpoint.split(':')[0]

          if (ip.length > 0) {
            if (!getState().network.nodes.geoData[ip]) {
              lookups.push(ip)
            }

            endpoints.push({ addr: endpoint })
          }

          return endpoints
        }, [])

        lookups.map((ip, i) => {
          promises.push(new Promise((resolve, reject) => {
            setTimeout(() => {
              geoIp(ip, (response) => {
                if (response !== null) {
                  process.env.NODE_ENV === 'development' && console.info('HTTPS: GeoIp lookup', ip, '('+i+').')
                  resolve(response)
                } else {
                  reject('')
                }
              })
            }, i * 400)
          }))
        })

        Promise.all(promises).then(
          function AcceptHandler(geoData) {
            geoData.map((data) => {
              network.nodes.geoData[data.ip] = {
                country: data.country.name,
                lon: data.location.longitude,
                lat: data.location.latitude
              }
            })

            // Combine geoData from current lookups and state.
            const combinedGeoData = {
              ...getState().network.nodes.geoData,
              ...network.nodes.geoData
            }

            network.nodes.connected.map((peer) => {
              const ip = peer.addr.split(':')[0]

              // Convert to miliseconds.
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

            network.nodes.endpoints.map((peer) => {
              const ip = peer.addr.split(':')[0]

              if (combinedGeoData[ip]) {
                peer.country = combinedGeoData[ip].country
                peer.lat = combinedGeoData[ip].lat
                peer.lon = combinedGeoData[ip].lon
              }
            })

            dispatch({
              type: types.NETWORK_INFO,
              ...network
            })

            setTimeout(() => {
              dispatch(networkInfo())
            }, 60 * 1000)
          },
          function ErrorHandler(error) {
            process.env.NODE_ENV === 'development' && console.error('RPC: Network update promises error.', error)
          }
        )
      } else {
        process.env.NODE_ENV === 'development' && console.warn('RPC: Attempted updating network info, next in 10s.')
        setTimeout(() => {
          dispatch(networkInfo())
        }, 10 * 1000)
      }
    })
  }
}
