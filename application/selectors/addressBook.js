import { createSelector } from 'reselect'

const getByAccount = (state) => state.addressBook.byAccount
const getAccount = (state) => state.addressBook.showAccount

export const getAccountData = createSelector([getByAccount, getAccount], (byAccount, account) => {
  if (account in byAccount) {
    return byAccount[account]
  } else {
    return {
      addresses: [],
      balance: 0
    }
  }
})
