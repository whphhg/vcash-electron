import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import { icon } from 'leaflet'

@inject('network')
@observer

class NetworkGeoMap extends React.Component {
  constructor(props) {
    super(props)
    this.network = props.network

    /** Custom leaflet markers. */
    this.markers = {
      connected: icon({
        iconUrl: 'assets/images/markerConnected.png',
        shadowUrl: 'assets/images/markerShadow.png'
      }),
      endpoint: icon({
        iconUrl: 'assets/images/markerEndpoint.png',
        shadowUrl: 'assets/images/markerShadow.png'
      })
    }
  }

  render() {
    return (
      <Map center={[45.965, -42.47]} zoom={3} attributionControl={false} scrollWheelZoom={false}>
        <TileLayer
          url='http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
        />
        {
          this.network.uniqueEndpointLocations.map((endpoint) => (
            <Marker key={v4()} icon={this.markers.endpoint} position={[endpoint.lat, endpoint.lon]}>
              <Popup>
                <div>
                  <p>Node address <span className='font-weight-500'>{endpoint.addr}</span></p>
                  <p>Located in <span className='font-weight-500'>{endpoint.country}</span></p>
                  <br />
                  <p>Known endpoint.</p>
                </div>
              </Popup>
            </Marker>
          ))
        }
        {
          this.network.connectedNodes.map((node) => (
            <Marker key={v4()} icon={this.markers.connected} position={[node.lat, node.lon]}>
              <Popup>
                <div>
                  <p>Node address <span className='font-weight-500'>{node.addr}</span></p>
                  <p>Located in <span className='font-weight-500'>{node.country}</span></p>
                  <p>Running <span className='font-weight-500'>{node.subverClean}</span> on <span className='font-weight-500'>{node.os}</span></p>
                  <br />
                  <p>You are connected to this node.</p>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </Map>
    )
  }
}

export default NetworkGeoMap
