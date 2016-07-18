import { connect } from 'react-redux'
import TransactionsShowCategory from '../components/TransactionsShowCategory'
import { transactionsSetShowCategory } from '../actions/transactions'

const mapStateToProps = (state) => ({
  showCategory: state.transactions.showCategory
})

const mapDispatchToProps = (dispatch) => ({
  setCategory: (event, index, value) => {
    dispatch(transactionsSetShowCategory(value))
  }
})

const TransactionsShowCategoryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsShowCategory)

export default TransactionsShowCategoryContainer
