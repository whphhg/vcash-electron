import React from 'react'
import { inject, observer } from 'mobx-react'
import AutoComplete from 'material-ui/AutoComplete'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'

@inject('addressBook')
@inject('addressNew')
@observer

class AddressNew extends React.Component {
  constructor(props) {
    super(props)
    this.addressBook = props.addressBook
    this.addressNew = props.addressNew

    this.getnewaddress = this.getnewaddress.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.toggleDialog = this.toggleDialog.bind(this)
    this.toggleSnackbar = this.toggleSnackbar.bind(this)
  }

  getnewaddress() {
    this.addressNew.getnewaddress()
  }

  setAccount(account) {
    this.addressNew.setAccount(account)
  }

  toggleDialog() {
    this.addressNew.toggleDialog()
  }

  toggleSnackbar() {
    this.addressNew.toggleSnackbar()
  }

  render() {
    return (
      <div>
        <Dialog
          title='Assign your new address to an account'
          actions={[
            <FlatButton label='Cancel' onTouchTap={this.toggleDialog} />,
            <FlatButton label='Get new address' onTouchTap={this.getnewaddress} disabled={this.addressNew.button === false} primary={true} />
          ]}
          modal={true}
          autoScrollBodyContent={true}
          open={this.addressNew.dialog}
        >
          <AutoComplete
            onNewRequest={this.setAccount}
            onUpdateInput={this.setAccount}
            searchText={this.addressNew.account}
            errorText={this.addressNew.errors.invalid && 'Account name can contain only alphanumerical characters and spaces.'}
            floatingLabelText="Assign to account"
            filter={AutoComplete.fuzzyFilter}
            maxSearchResults={5}
            dataSource={this.addressBook.accounts}
            fullWidth={true}
          />
        </Dialog>
        <Snackbar
          open={this.addressNew.snackbar}
          message={'New address added to account "' + this.addressNew.account + '".'}
          autoHideDuration={5 * 1000}
          onRequestClose={this.toggleSnackbar}
        />
      </div>
    )
  }
}

export default AddressNew
