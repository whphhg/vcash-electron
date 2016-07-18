import { connect } from 'react-redux'
import Network from '../components/Network'

const mapStateToProps = (state) => ({
  state: state.network,
  incentive: state.incentive,
  blocks: state.wallet.info.blocks
})

const NetworkContainer = connect(
  mapStateToProps
)(Network)

export default NetworkContainer
