import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

export const incentiveInfo = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'getincentiveinfo',
      params: []
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        const properties = Object.keys(getState().incentive)
        let update = false

        properties.map((property) => {
          if (response.result[property.toLowerCase()] !== getState().incentive[property]) {
            update = true
          }
        })

        if (update) {
          dispatch({
            type: types.INCENTIVE_INFO,
            ...response.result
          })
        }

        setTimeout(() => {
          dispatch(incentiveInfo())
        }, 45 * 1000)
      } else {
        process.env.NODE_ENV === 'development' && console.warn('RPC: Attempted updating incentive info, next in 10s.')
        setTimeout(() => {
          dispatch(incentiveInfo())
        }, 10 * 1000)
      }
    })
  }
}
