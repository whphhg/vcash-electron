import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = {
  info: {
    balance: 0,
    newMint: 0,
    stake: 0,
    blocks: 0,
    moneySupply: 0,
    connections: 0,
    ip: '',
    port: 0,
    version: '',
    protocolVersion: '',
    walletVersion: '',
  },
  status: {
    isRunning: null,
    isLocked: false,
    isEncrypted: false
  }
}

const info = (state = initialState.info, action) => {
  switch (action.type) {
    case types.WALLET_INFO:
      return {
        balance: action.balance,
        newMint: action.newmint,
        stake: action.stake,
        blocks: action.blocks,
        moneySupply: action.moneysupply,
        connections: action.connections,
        ip: action.ip,
        port: action.port,
        version: action.version,
        protocolVersion: action.protocolversion,
        walletVersion: action.walletversion
      }

    default:
      return state
  }
}

const status = (state = initialState.status, action) => {
  switch (action.type) {
    case types.WALLET_DAEMON:
      return {
        ...state,
        isRunning: action.isRunning
      }

    case types.WALLET_ENCRYPT:
      return {
        ...state,
        isLocked: true,
        isEncrypted: true
      }

    case types.WALLET_LOCK:
      return {
        ...state,
        isLocked: true
      }

    case types.WALLET_LOCK_CHECK:
      return {
        ...state,
        isLocked: action.isLocked,
        isEncrypted: action.isEncrypted
      }

    case types.WALLET_UNLOCK:
      return {
        ...state,
        isLocked: false
      }

    default:
      return state
  }
}

const wallet = combineReducers({
  info,
  status
})

export default wallet
