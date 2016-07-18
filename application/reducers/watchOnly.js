import * as types from '../constants/ActionTypes'

const initialState = {
  addresses: [],
  byAddress: {},
  updateTimer: 0
}

const watchOnly = (state = initialState, action) => {
  switch (action.type) {
    case types.WATCHONLY_ADD:
      return {
        ...state,
        addresses: [...state.addresses, action.address],
        byAddress: {
          ...state.byAddress,
          [action.address]: {
            address: action.address,
            balance: 0,
            lastUpdate: 0,
            note: action.note,
            transactions: []
          }
        }
      }

    case types.WATCHONLY_EDIT:
      return {
        ...state,
        byAddress: {
          ...state.byAddress,
          [action.address]: {
            ...state.byAddress[action.address],
            note: action.note
          }
        }
      }

    case types.WATCHONLY_EXPLORER_LOOKUP:
      return {
        ...state,
        byAddress: {
          ...state.byAddress,
          ...state.addresses.reduce((byAddress, address) => {
            if (action.byAddress[address]) {
              byAddress[address] = {
                ...state.byAddress[address],
                ...action.byAddress[address],
                lastUpdate: Date.now()
              }
            }

            return byAddress
          }, {})
        },
        updateTimer: action.updateTimer
      }

    case types.WATCHONLY_REMOVE:
      return {
        ...state,
        addresses: state.addresses.filter((address) => {
          return address !== action.address
        }),
        byAddress: state.addresses.reduce((byAddress, address) => {
          if (address !== action.address) {
            byAddress[address] = state.byAddress[address]
          }

          return byAddress
        }, {})
      }

    default:
      return state
  }
}

export default watchOnly
