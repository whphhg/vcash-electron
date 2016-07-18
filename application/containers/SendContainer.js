import { connect } from 'react-redux'
import Send from '../components/Send'

import {
  send,
  sendRecipientNew,
  sendRecipientRemove,
  sendRecipientSetAddress,
  sendRecipientSetAmount,
  sendSetAccount,
  sendToggleButton,
  sendToggleDrawer,
} from '../actions/send'
import { getExchangeRate, getLocalRate } from '../selectors/rates'

const mapStateToProps = (state) => ({
  state: state.ui.send,
  accounts: state.addressBook.accounts,
  balance: state.addressBook.byAccount[state.ui.send.account].balance,
  isLocked: state.wallet.status.isLocked,
  localCurrency: state.settings.localCurrency,
  rate: getExchangeRate(state) * getLocalRate(state)
})

const SendContainer = connect(
  mapStateToProps,
  {
    newRecipient: sendRecipientNew,
    removeRecipient: sendRecipientRemove,
    send,
    setAccount: sendSetAccount,
    setAddress: sendRecipientSetAddress,
    setAmount: sendRecipientSetAmount,
    toggleButton: sendToggleButton,
    toggleDrawer: sendToggleDrawer
  }
)(Send)

export default SendContainer
