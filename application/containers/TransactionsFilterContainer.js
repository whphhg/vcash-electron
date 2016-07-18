import { connect } from 'react-redux'
import TransactionsFilter from '../components/TransactionsFilter'
import { transactionsSetFilterBy } from '../actions/transactions'

const mapStateToProps = (state) => ({
  filterBy: state.transactions.filterBy
})

const TransactionsSetFilterContainer = connect(
  mapStateToProps,
  {
    setFilter: transactionsSetFilterBy
  }
)(TransactionsFilter)

export default TransactionsSetFilterContainer
