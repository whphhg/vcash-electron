import { connect } from 'react-redux'
import WalletUnlock from '../components/WalletUnlock'

import { walletLock } from '../actions/walletLock'
import {
  walletUnlock,
  walletUnlockSetPassphrase,
  walletUnlockToggleDialog,
  walletUnlockToggleSnackbar
} from '../actions/walletUnlock'

const mapStateToProps = (state) => ({
  state: state.ui.walletUnlock
})

const mapDispatchToProps = (dispatch) => ({
  setPassphrase: (event) => {
    dispatch(walletUnlockSetPassphrase(event.target.value))
  },
  toggleDialog: () => {
    dispatch(walletUnlockToggleDialog())
  },
  toggleSnackbar: () => {
    dispatch(walletUnlockToggleSnackbar())
  },
  walletLock: () => {
    dispatch(walletLock())
  },
  walletUnlock: () => {
    dispatch(walletUnlock())
  }
})

const WalletUnlockContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletUnlock)

export default WalletUnlockContainer
