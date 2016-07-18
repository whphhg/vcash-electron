import { connect } from 'react-redux'
import WalletLock from '../components/WalletLock'

import { walletLockToggleSnackbar } from '../actions/walletLock'
import { walletUnlockToggleDialog } from '../actions/walletUnlock'

const mapStateToProps = (state) => ({
  ...state.ui.walletLock
})

const WalletLockContainer = connect(
  mapStateToProps,
  {
    toggleLock: walletLockToggleSnackbar,
    toggleUnlock: walletUnlockToggleDialog
  }
)(WalletLock)

export default WalletLockContainer
