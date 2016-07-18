import { connect } from 'react-redux'
import NetworkGeoMap from '../components/NetworkGeoMap'
import { getUniqueEndpointLocations } from '../selectors/network'

const mapStateToProps = (state) => ({
  connectedNodes: state.network.nodes.connected,
  uniqueEndpoints: getUniqueEndpointLocations(state)
})

const NetworkGeoMapContainer = connect(
  mapStateToProps
)(NetworkGeoMap)

export default NetworkGeoMapContainer
