import React from 'react'
import { inject, observer } from 'mobx-react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

@inject('walletEncrypt')
@observer

class WalletEncrypt extends React.Component {
  constructor(props) {
    super(props)
    this.walletEncrypt = props.walletEncrypt

    this.encryptwallet = this.encryptwallet.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.setRepeat = this.setRepeat.bind(this)
    this.toggleDialog = this.toggleDialog.bind(this)
    this.toggleSnackbar = this.toggleSnackbar.bind(this)
  }

  encryptwallet() {
    this.walletEncrypt.encryptwallet()
  }

  setPassphrase(event) {
    this.walletEncrypt.setPassphrase(event.target.value)
  }

  setRepeat(event) {
    this.walletEncrypt.setRepeat(event.target.value)
  }

  toggleDialog() {
    this.walletEncrypt.toggleDialog()
  }

  toggleSnackbar() {
    this.walletEncrypt.toggleSnackbar()
  }

  render() {
    return (
      <div>
        <Dialog
          title='Encrypt wallet'
          actions={[
            <FlatButton onTouchTap={this.toggleDialog} label='Cancel' />,
            <FlatButton onTouchTap={this.encryptwallet} primary={true} disabled={this.walletEncrypt.button === false} label='Encrypt wallet' />
          ]}
          autoScrollBodyContent={true}
          open={this.walletEncrypt.dialog}
        >
          <TextField
            onChange={this.setPassphrase}
            type='password'
            fullWidth={true}
            hintText='Your passphrase'
            floatingLabelStyle={{fontWeight:'normal'}}
            floatingLabelText='Enter wallet passphrase'
            underlineStyle={this.walletEncrypt.button ? {borderColor: 'green'} : {}}
          />
          <TextField
            onChange={this.setRepeat}
            floatingLabelStyle={{fontWeight:'normal'}}
            floatingLabelText='Repeat passphrase'
            type='password'
            fullWidth={true}
            hintText='Repeat passphrase'
            underlineStyle={this.walletEncrypt.button ? {borderColor: 'green'} : {}}
          />
        </Dialog>
        <Snackbar
          open={this.walletEncrypt.snackbar}
          message="Wallet has been encrypted. Re-start the daemon."
          autoHideDuration={15 * 1000}
          onRequestClose={this.toggleSnackbar}
        />
      </div>
    )
  }
}

export default WalletEncrypt
