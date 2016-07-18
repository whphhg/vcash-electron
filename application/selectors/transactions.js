import { createSelector } from 'reselect'
import { getExchangeRate, getLocalRate } from './rates'
import moment from 'moment'

const getConfirmed = (state) => state.transactions.confirmed
const getFilterBy = (state) => state.transactions.filterBy
const getShowCategory = (state) => state.transactions.showCategory
const getShowSince = (state) => state.transactions.showSince
const getUnconfirmed = (state) => state.transactions.unconfirmed

export const getChartData = createSelector([getConfirmed], (transactions) => {
  const today = moment(new Date())
  const threshold = new Date().getTime() - (31 * 24 * 60 * 60 * 1000) // today-31 days
  let data = []
  let dataByDate = []

  for (let i = 0; i < 31; i++) {
    const date = i === 0 ? today.format('L') : today.subtract(1, 'day').format('L')

    dataByDate.unshift(date)
    data.unshift({
      date,
      send: 0,
      receive: 0,
      generate: 0,
      immature: 0
    })
  }

  transactions.reduce((data, tx) => {
    // Check if time is in the last 31 days window.
    if (tx.time * 1000 > threshold) {
      const txDate = moment(tx.time * 1000).format('L')
      const index = dataByDate.indexOf(txDate)

      if (index > -1) {
        data[index] = {
          ...data[index],
          [tx.category]: Math.abs(parseFloat(parseFloat(data[index][tx.category] + tx.amount).toFixed(6)))
        }
      }
    }

    return data
  }, data)

  return data
})

export const getFilteredTransactions = createSelector([getConfirmed, getFilterBy, getShowCategory, getShowSince, getUnconfirmed, getExchangeRate, getLocalRate], (confirmed, filterBy, showCategory, showSince, unconfirmed, exchangeRate, localRate) => {
  const rate = parseFloat(exchangeRate * localRate)
  const threshold = moment(showSince).unix()
  let transactions = [
    ...confirmed,
    ...unconfirmed
  ]

  transactions = transactions.reduce((transactions, tx) => {
    // Show only transactions since provided date.
    if (tx.time > threshold) {
      // Show only selected category or all categories.
      if (tx.category === showCategory || showCategory === 'all') {
        // Set local amount.
        tx.amountLocal = parseFloat(tx.amount * rate)

        // Filter, if set.
        if (filterBy.length > 0) {
          let found = 0

          // Increment found by 1 each time a filter matches.
          filterBy.forEach((filter) => {
            if (tx.account && tx.account.indexOf(filter) > -1 ||
                tx.address && tx.address.indexOf(filter) > -1 ||
                tx.category && tx.category.indexOf(filter) > -1 ||
                tx.amount && String(tx.amount.toFixed(6)).indexOf(filter) > -1 ||
                tx.amountLocal && String(tx.amountLocal.toFixed(2)).indexOf(filter) > -1 ||
                tx.blockhash && tx.blockhash.indexOf(filter) > -1 ||
                tx.txid && tx.txid.indexOf(filter) > -1 ||
                tx.time && moment(new Date(tx.time * 1000)).format('YYYY-MM-DD - HH:mm:ss').indexOf(filter) > -1)
            {
              found += 1
            }
          })

          // Push tx when the length of filters array and filter occurances found in a tx match.
          if (found === filterBy.length) {
            transactions.push(tx)
          }
        } else {
          transactions.push(tx)
        }
      }
    }

    return transactions
  }, [])

  // Sort by date.
  transactions = transactions.sort((a, b) => {
    return parseInt(b.time) - parseInt(a.time)
  })

  if (filterBy.length > 0) {
    process.env.NODE_ENV === 'development' && console.info('Transactions filter present: ', filterBy)
  }

  return transactions
})
