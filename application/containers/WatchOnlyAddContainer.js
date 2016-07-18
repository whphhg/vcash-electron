import { connect } from 'react-redux'
import WatchOnlyAdd from '../components/WatchOnlyAdd'

import { watchOnlyAdd, watchOnlyExplorerLookup } from '../actions/watchOnly'
import {
  watchOnlyAddSetAddress,
  watchOnlyAddSetNote,
  watchOnlyAddToggleDialog,
  watchOnlyAddToggleSnackbar
} from '../actions/watchOnlyAdd'

const mapStateToProps = (state) => ({
  state: state.ui.watchOnlyAdd
})

const mapDispatchToProps = (dispatch) => ({
  addAddress: (address, note) => {
    dispatch(watchOnlyAdd(address, note))
  },
  explorerLookup: () => {
    dispatch(watchOnlyExplorerLookup())
  },
  setAddress: (event) => {
    dispatch(watchOnlyAddSetAddress(event.target.value))
  },
  setNote: (event) => {
    dispatch(watchOnlyAddSetNote(event.target.value))
  },
  toggleDialog: () => {
    dispatch(watchOnlyAddToggleDialog())
  },
  toggleSnackbar: () => {
    dispatch(watchOnlyAddToggleSnackbar())
  }
})

const WatchOnlyAddContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WatchOnlyAdd)

export default WatchOnlyAddContainer
