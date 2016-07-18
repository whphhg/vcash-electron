import { connect } from 'react-redux'
import WalletEncrypt from '../components/WalletEncrypt'
import {
  walletEncrypt,
  walletEncryptSetPassphrase,
  walletEncryptSetRepeat,
  walletEncryptToggleDialog,
  walletEncryptToggleSnackbar
} from '../actions/walletEncrypt'

const mapStateToProps = (state) => ({
  state: state.ui.walletEncrypt
})

const mapDispatchToProps = (dispatch) => ({
  setPassphrase: (event) => {
    dispatch(walletEncryptSetPassphrase(event.target.value))
  },
  setRepeat: (event) => {
    dispatch(walletEncryptSetRepeat(event.target.value))
  },
  toggleDialog: () => {
    dispatch(walletEncryptToggleDialog())
  },
  toggleSnackbar: () => {
    dispatch(walletEncryptToggleSnackbar())
  },
  walletEncrypt: () => {
    dispatch(walletEncrypt())
  }
})

const WalletEncryptContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletEncrypt)

export default WalletEncryptContainer
