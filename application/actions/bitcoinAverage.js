import * as types from '../constants/ActionTypes'
import https from 'https'

export const bitcoinAverage = () => {
  return (dispatch, getState) => {
    const options = {
      hostname: 'api.bitcoinaverage.com',
      path: '/ticker/global/all'
    }

    dispatch({
      type: types.BITCOINAVERAGE_REQUEST
    })

    https.get(options, (response) => {
      if (response.headers['content-type'] === 'application/json') {
        let buffer = ''

        response.on('data', (data) => {
          buffer += data
        })

        response.on('end', () => {
          try {
            let localCurrencies = JSON.parse(buffer)
            delete localCurrencies.timestamp

            dispatch({
              type: types.BITCOINAVERAGE_RESPONSE,
              list: localCurrencies
            })
          } catch (exception) {
            process.env.NODE_ENV === 'development' && console.error('HTTPS: Error parsing bitcoinaverage response.', exception)
          }

          setTimeout(() => {
            return dispatch(bitcoinAverage())
          }, 120 * 1000)
        })
      }
    }).on('error', (error) => {
      process.env.NODE_ENV === 'development' && console.warn('HTTPS: Attempted updating bitcoinaverage, next in 20s.')
      setTimeout(() => {
        return dispatch(bitcoinAverage())
      }, 20 * 1000)
    })
  }
}
