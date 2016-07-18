import { connect } from 'react-redux'
import TransactionsChart from '../components/TransactionsChart'
import { getChartData } from '../selectors/transactions'

const mapStateToProps = (state) => ({
  chartData: getChartData(state)
})

const TransactionsChartContainer = connect(
  mapStateToProps
)(TransactionsChart)

export default TransactionsChartContainer
