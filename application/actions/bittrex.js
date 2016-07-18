import * as types from '../constants/ActionTypes'
import https from 'https'

export const bittrex = () => {
  return (dispatch, getState) => {
    const options = {
      hostname: 'bittrex.com',
      path: '/api/v1.1/public/getmarketsummary?market=btc-xvc'
    }

    dispatch({
      type: types.BITTREX_REQUEST
    })

    https.get(options, (response) => {
      if (response.headers['content-type'] === 'application/json; charset=utf-8') {
        let buffer = ''

        response.on('data', (data) => {
          buffer += data
        })

        response.on('end', () => {
          try {
            let bittrex = JSON.parse(buffer)
                bittrex = bittrex.result[0]

            dispatch({
              type: types.BITTREX_RESPONSE,
              data: {
                high: bittrex.High,
                low: bittrex.Low,
                volume: bittrex.Volume,
                last: bittrex.Last,
                bid: bittrex.Bid,
                ask: bittrex.Ask,
                openBuyOrders: bittrex.OpenBuyOrders,
                openSellOrders: bittrex.OpenSellOrders
              }
            })
          } catch (exception) {
            process.env.NODE_ENV === 'development' && console.error('HTTPS: Error parsing bittrex response.', exception)
          }

          setTimeout(() => {
            return dispatch(bittrex())
          }, 30 * 1000)
        })
      }
    }).on('error', (error) => {
      process.env.NODE_ENV === 'development' && console.warn('HTTPS: Attempted updating bittrex, next in 10s.')
      setTimeout(() => {
        return dispatch(bittrex())
      }, 10 * 1000)
    })
  }
}
