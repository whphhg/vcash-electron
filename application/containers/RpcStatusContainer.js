import { connect } from 'react-redux'
import RpcStatus from '../components/RpcStatus'

const mapStateToProps = (state) => ({
  isRunning: state.wallet.status.isRunning
})

const RpcStatusContainer = connect(
  mapStateToProps
)(RpcStatus)

export default RpcStatusContainer
