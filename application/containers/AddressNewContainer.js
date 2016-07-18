import { connect } from 'react-redux'
import AddressNew from '../components/AddressNew'
import {
  addressNew,
  addressNewSetAccount,
  addressNewToggleDialog,
  addressNewToggleSnackbar
} from '../actions/addressNew'

const mapStateToProps = (state) => ({
  state: state.ui.addressNew,
  accounts: state.addressBook.accounts
})

const AddressNewContainer = connect(
  mapStateToProps,
  {
    addressNew,
    setAccount: addressNewSetAccount,
    toggleDialog: addressNewToggleDialog,
    toggleSnackbar: addressNewToggleSnackbar
  }
)(AddressNew)

export default AddressNewContainer
