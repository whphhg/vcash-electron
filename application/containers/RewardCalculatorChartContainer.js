import { connect } from 'react-redux'
import RewardCalculatorChart from '../components/RewardCalculatorChart'
import { getChartData } from '../selectors/rewardCalculator'

const mapStateToProps = (state) => ({
  chartData: getChartData(state)
})

const RewardCalculatorChartContainer = connect(
  mapStateToProps
)(RewardCalculatorChart)

export default RewardCalculatorChartContainer
