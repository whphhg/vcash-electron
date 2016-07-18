import * as types from '../constants/ActionTypes'

const initialState = {
  walletAddress: '',
  collateralRequired: 0,
  collateralBalance: 0,
  networkStatus: 'firewalled',
  voteCandidate: false
}

const incentive = (state = initialState, action) => {
  switch (action.type) {
    case types.INCENTIVE_INFO:
      return {
        walletAddress: action.walletaddress,
        collateralRequired: action.collateralrequired,
        collateralBalance: action.collateralbalance,
        networkStatus: action.networkstatus,
        voteCandidate: action.votecandidate
      }

    default:
      return state
  }
}

export default incentive
