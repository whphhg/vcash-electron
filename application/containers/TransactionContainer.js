import { connect } from 'react-redux'
import Transaction from '../components/Transaction'
import { transactionToggleDialog } from '../actions/transaction'

const mapStateToProps = (state) => ({
  transaction: state.ui.transaction
})

const TransactionContainer = connect(
  mapStateToProps,
  {
    toggleDialog: transactionToggleDialog
  }
)(Transaction)

export default TransactionContainer
