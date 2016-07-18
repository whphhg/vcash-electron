import { createSelector } from 'reselect'

const getConnectedNodes = (state) => state.network.nodes.connected
const getEndpoints = (state) => state.network.nodes.endpoints

export const getUniqueEndpointLocations = createSelector([getConnectedNodes, getEndpoints], (connected, endpoints) => {
  // Add connected nodes locations to the uniqueLocations array.
  let uniqueLocations = connected.reduce((uniqueLocations, node) => {
    if (node.lat && node.lon) {
      uniqueLocations.push({
        lat: node.lat,
        lon: node.lon
      })
    }

    return uniqueLocations
  }, [])

  // Add endpoints with unique location to the uniqueEndpoints array.
  const uniqueEndpoints = endpoints.reduce((uniqueEndpoints, endpoint) => {
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
})
