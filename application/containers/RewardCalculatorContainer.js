import { connect } from 'react-redux'
import RewardCalculator from '../components/RewardCalculator'
import { rewardCalculator } from '../actions/rewardCalculator'

const mapStateToProps = (state) => ({
  ...state.ui.rewardCalculator
})

const RewardCalculatorContainer = connect(
  mapStateToProps,
  { rewardCalculator }
)(RewardCalculator)

export default RewardCalculatorContainer
