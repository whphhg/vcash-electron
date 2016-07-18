import * as types from '../constants/ActionTypes'
import autobahn from 'autobahn'

export const poloniex = () => {
  return (dispatch, getState) => {
    let wss = new autobahn.Connection({
      url: 'wss://api.poloniex.com',
      realm: 'realm1'
    })

    dispatch({
      type: types.POLONIEX_REQUEST
    })

    wss.onopen = (session) => {
      dispatch({
        type: types.POLONIEX_OPEN
      })

      const tickerEvent = (args) => {
        const previousLast = getState().rates.poloniex.last

        if (args[0] === 'BTC_XVC') {
          dispatch({
            type: types.POLONIEX_TICKER,
            ticker: {
              last: args[1],
              lowestAsk: args[2],
              highestBid: args[3],
              percentChange: args[4],
              baseVolume: args[5],
              quoteVolume: args[6],
              dailyHigh: args[8],
              dailyLow: args[9]
            }
          })
        }
      }

      session.subscribe('ticker', tickerEvent)
    }

    wss.onclose = () => {
      dispatch({
        type: types.POLONIEX_CLOSED
      })
    }

    wss.open()
  }
}
