import * as types from '../constants/ActionTypes'
import rpc from '../utilities/rpc'

export const chainBlenderInfo = () => {
  return (dispatch, getState) => {
    if (getState().wallet.status.isLocked === false || getState().wallet.status.isRunning === null) {
      const options = {
        method: 'chainblender',
        params: ['info']
      }

      // FIXME: Locking without toggling CB leaves it toggled after unlocking.
      rpc(options, dispatch, getState, (response) => {
        if (response !== null) {
          if (response.hasOwnProperty('result')) {
            let properties = Object.keys(getState().chainBlender)
                properties.splice(properties.indexOf('isActivated'), 1)
            let update = false

            properties.map((property) => {
              if (response.result[property.toLowerCase()] !== getState().chainBlender[property]) {
                update = true
              }
            })

            if (update) {
              let isActivated = null

              if (response.result.blendstate === 'active' && getState().chainBlender.isActivated === false) {
                isActivated = true
              }

              dispatch({
                type: types.CHAINBLENDER_INFO,
                ...response.result,
                isActivated
              })
            }
          }
        }
      })
    }

    setTimeout(() => {
      return dispatch(chainBlenderInfo())
    }, 15 * 1000)
  }
}

export const chainBlenderToggle = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'chainblender',
      params: [getState().chainBlender.isActivated ? 'stop' : 'start']
    }

    rpc(options, dispatch, getState, (response) => {
      if (response !== null) {
        dispatch({
          type: types.CHAINBLENDER_TOGGLE
        })
      }
    })
  }
}
