import { connect } from 'react-redux'
import WatchOnlyView from '../components/WatchOnlyView'

import { watchOnlyRemove } from '../actions/watchOnly'
import { watchOnlyViewSetNote, watchOnlyViewToggleDialog } from '../actions/watchOnlyView'
import { getWatchOnlyView } from '../selectors/watchOnlyView'

const mapStateToProps = (state) => ({
  state: state.ui.watchOnlyView,
  address: getWatchOnlyView(state)
})

const mapDispatchToProps = (dispatch) => ({
  removeAddress: (address) => {
    dispatch(watchOnlyRemove(address))
  },
  setNote: (event) => {
    dispatch(watchOnlyViewSetNote(event.target.value))
  },
  toggleDialog: () => {
    dispatch(watchOnlyViewToggleDialog())
  }
})

const WatchOnlyViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WatchOnlyView)

export default WatchOnlyViewContainer
