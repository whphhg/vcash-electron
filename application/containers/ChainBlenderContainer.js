import { connect } from 'react-redux'
import ChainBlender from '../components/ChainBlender'
import { chainBlenderToggle } from '../actions/chainBlender'

const mapStateToProps = (state) => ({
  state: state.chainBlender,
  isLocked: state.wallet.status.isLocked,
})

const ChainBlenderContainer = connect(
  mapStateToProps,
  {
    toggleBlender: chainBlenderToggle
  }
)(ChainBlender)

export default ChainBlenderContainer
