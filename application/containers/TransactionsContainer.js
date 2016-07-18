import { connect } from 'react-redux'
import Transactions from '../components/Transactions'

import { transactionToggleDialog } from '../actions/transaction'
import { getFilteredTransactions } from '../selectors/transactions'

const mapStateToProps = (state) => ({
  transactions: getFilteredTransactions(state),
  localCurrency: state.settings.localCurrency
})

const TransactionsContainer = connect(
  mapStateToProps,
  {
    toggleDialog: transactionToggleDialog,
  }
)(Transactions)

export default TransactionsContainer
