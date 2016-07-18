import { connect } from 'react-redux'
import TransactionsShowSince from '../components/TransactionsShowSince'
import { transactionsSetShowSince } from '../actions/transactions'

const mapStateToProps = (state) => ({
  showSince: state.transactions.showSince
})

const mapDispatchToProps = (dispatch) => ({
  setShowSince: (empty, since) => {
    dispatch(transactionsSetShowSince(since))
  }
})

const TransactionsShowSinceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsShowSince)

export default TransactionsShowSinceContainer
