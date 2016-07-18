import { connect } from 'react-redux'
import KeyImport from '../components/KeyImport'
import {
  keyImport,
  keyImportSetAccount,
  keyImportSetKey,
  keyImportToggleDialog,
  keyImportToggleSnackbar
} from '../actions/keyImport'

const mapStateToProps = (state) => ({
  state: state.ui.keyImport,
  accounts: state.addressBook.accounts,
  isLocked: state.wallet.status.isLocked
})

const mapDispatchToProps = (dispatch) => ({
  keyImport: () => {
    dispatch(keyImport())
  },
  setAccount: (account) => {
    dispatch(keyImportSetAccount(account))
  },
  setKey: (event) => {
    dispatch(keyImportSetKey(event.target.value))
  },
  toggleDialog: () => {
    dispatch(keyImportToggleDialog())
  },
  toggleSnackbar: () => {
    dispatch(keyImportToggleSnackbar())
  }
})

const KeyImportContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyImport)

export default KeyImportContainer
