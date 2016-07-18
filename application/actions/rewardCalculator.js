import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'
import { calculateIncentive, calculatePoW } from '../utilities/calculateBlockRewards'

export const rewardCalculator = (block) => {
  return (dispatch, getState) => {
    // Clear if text input is empty.
    if (!block) {
      return dispatch({
        type: types.REWARD_CALCULATOR_CLEAR
      })
    }

    const powPercent = calculateIncentive(block)
    const powReward = calculatePoW(block)
    const incentiveReward = (powReward / 100) * powPercent
    let update = true

    if (!block.match(/^[0-9]{0,7}$/)) {
      update = false
    }

    if (update) {
      if (block <= getState().wallet.info.blocks) {
        const options = {
          method: 'getblockhash',
          params: [block]
        }

        rpc(options, dispatch, getState, (response) => {
          if (response !== null) {
            const options = {
              method: 'getblock',
              params: [response.result]
            }

            rpc(options, dispatch, getState, (response) => {
              if (response !== null) {
                dispatch({
                  type: types.REWARD_CALCULATOR,
                  block,
                  time: new Date(response.result.time * 1000),
                  estimate: false,
                  incentiveReward,
                  powPercent,
                  powReward
                })
              }
            })
          }
        })
      } else {
        /**
         * Variable block time targeting 80-200 seconds.
         * 200 - 80 = 120 / 2 = 60 + 80 = 140
         */
        let time = new Date()
        time.setSeconds(time.getSeconds() + (block - getState().wallet.info.blocks) * 140)

        dispatch({
          type: types.REWARD_CALCULATOR,
          block,
          time,
          estimate: true,
          incentiveReward,
          powPercent,
          powReward
        })
      }
    }
  }
}
