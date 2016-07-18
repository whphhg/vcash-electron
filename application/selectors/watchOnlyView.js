import { createSelector } from 'reselect'

const getByAddress = (state) => state.watchOnly.byAddress
const getAddress = (state) => state.ui.watchOnlyView.address

export const getWatchOnlyView = createSelector([getByAddress, getAddress], (byAddress, address) => {
  if (address in byAddress) {
    return byAddress[address]
  } else {
    return {
      balance: 0,
      lastUpdate: 0,
      note: '',
      received: 0
    }
  }
})
