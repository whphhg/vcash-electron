import React from 'react'
import { inject, observer } from 'mobx-react'
import AutoComplete from 'material-ui/AutoComplete'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

@inject('addressBook')
@inject('keyImport')
@observer

class KeyImport extends React.Component {
  constructor(props) {
    super(props)
    this.addressBook = props.addressBook
    this.keyImport = props.keyImport

    this.importprivkey = this.importprivkey.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setPrivateKey = this.setPrivateKey.bind(this)
    this.toggleDialog = this.toggleDialog.bind(this)
    this.toggleSnackbar = this.toggleSnackbar.bind(this)
  }

  importprivkey() {
    this.keyImport.importprivkey()
  }

  setAccount(account) {
    this.keyImport.setAccount(account)
  }

  setPrivateKey(event) {
    this.keyImport.setPrivateKey(event.target.value)
  }

  toggleDialog() {
    this.keyImport.toggleDialog()
  }

  toggleSnackbar() {
    this.keyImport.toggleSnackbar()
  }

  render() {
    return (
      <div>
        <Dialog
          title='Import private key'
          actions={[
            <FlatButton label='Cancel' onTouchTap={this.toggleDialog} />,
            <FlatButton label='Import private key' onTouchTap={this.importprivkey} disabled={this.keyImport.button === false} primary={true} />
          ]}
          modal={true}
          autoScrollBodyContent={true}
          open={this.keyImport.dialog}
        >
          <TextField
            onChange={this.setPrivateKey}
            fullWidth={true}
            value={this.keyImport.privateKey}
            errorText={
              this.keyImport.errors.privateKey.alreadyImported && 'The private key you have entered belongs to your wallet.'
              || this.keyImport.errors.privateKey.invalid && 'The private key you have entered is invalid.'
            }
            floatingLabelText='Private key'
            hintText='Enter the private key'
          />
          <AutoComplete
            onNewRequest={this.setAccount}
            onUpdateInput={this.setAccount}
            searchText={this.keyImport.account}
            errorText={this.keyImport.errors.account.invalid && 'Account name can contain only alphanumerical characters and spaces.'}
            floatingLabelText="Assign to account"
            filter={AutoComplete.fuzzyFilter}
            maxSearchResults={5}
            openOnFocus={true}
            dataSource={this.addressBook.accounts}
            fullWidth={true}
          />
        </Dialog>
        <Snackbar
          open={this.keyImport.snackbar}
          message={'Imported private key and assigned it to account "' + this.keyImport.account + '".'}
          autoHideDuration={5 * 1000}
          onRequestClose={this.toggleSnackbar}
        />
      </div>
    )
  }
}

export default KeyImport
