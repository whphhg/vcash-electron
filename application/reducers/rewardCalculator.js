import * as types from '../constants/ActionTypes'

const initialState = {
  block: '',
  time: '',
  estimate: false,
  incentiveReward: 0,
  powPercent: 0,
  powReward: 0
}

const rewardCalculator = (state = initialState, action) => {
  switch (action.type) {
    case types.REWARD_CALCULATOR:
      return {
        block: action.block,
        time: action.time,
        estimate: action.estimate,
        incentiveReward: action.incentiveReward.toFixed(6),
        powPercent: action.powPercent,
        powReward: action.powReward.toFixed(6)
      }

    case types.REWARD_CALCULATOR_CLEAR:
      return {
        ...initialState
      }

    default:
      return state
  }
}

export default rewardCalculator
