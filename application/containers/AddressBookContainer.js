import { connect } from 'react-redux'
import AddressBook from '../components/AddressBook'

import { addressBookSetShowAccount } from '../actions/addressBook'
import { addressNewToggleDialog } from '../actions/addressNew'
import { keyImportToggleDialog } from '../actions/keyImport'
import { watchOnlyAddToggleDialog } from '../actions/watchOnlyAdd'

import { getAccountData } from '../selectors/addressBook'
import { getExchangeRate, getLocalRate } from '../selectors/rates'

const mapStateToProps = (state) => ({
  state: state.addressBook,
  ...getAccountData(state),
  localCurrency: state.settings.localCurrency,
  rate: getExchangeRate(state) * getLocalRate(state)
})

const mapDispatchToProps = (dispatch) => ({
  showAccount: (event, index, value) => {
    dispatch(addressBookSetShowAccount(value))
  },
  toggleAddressNew: () => {
    dispatch(addressNewToggleDialog())
  },
  toggleKeyImport: () => {
    dispatch(keyImportToggleDialog())
  },
  toggleWatchOnlyAdd: () => {
    dispatch(watchOnlyAddToggleDialog())
  }
})

const AddressBookContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddressBook)

export default AddressBookContainer
