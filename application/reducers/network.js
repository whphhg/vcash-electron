import * as types from '../constants/ActionTypes'

const initialState = {
  ip: '',
  port: 0,
  tcp: 0,
  udp: 0,
  nodes: {
    connected: [],
    endpoints: [],
    geoData: {}
  }
}

const network = (state = initialState, action) => {
  switch (action.type) {
    case types.NETWORK_INFO:
      return {
        ip: action.ip,
        port: action.port,
        tcp: action.tcp,
        udp: action.udp,
        nodes: {
          connected: action.nodes.connected,
          endpoints: action.nodes.endpoints,
          geoData: {
            ...state.nodes.geoData,
            ...action.nodes.geoData
          }
        }
      }

    default:
      return state
  }
}

export default network
