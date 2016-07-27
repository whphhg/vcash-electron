import React from 'react'
import { inject, observer } from 'mobx-react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

@inject('walletLock')
@inject('walletUnlock')
@observer

class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
    this.walletLock = props.walletLock
    this.walletUnlock = props.walletUnlock

    this.setPassphrase = this.setPassphrase.bind(this)
    this.toggleDialog = this.toggleDialog.bind(this)
    this.toggleSnackbar = this.toggleSnackbar.bind(this)
    this.lock = this.lock.bind(this)
    this.unlock = this.unlock.bind(this)
  }

  setPassphrase(event) {
    this.walletUnlock.setPassphrase(event.target.value)
  }

  toggleDialog() {
    this.walletUnlock.toggleDialog()
  }

  toggleSnackbar() {
    this.walletUnlock.toggleSnackbar()
  }

  lock() {
    this.walletLock.lock()
  }

  unlock() {
    this.walletUnlock.unlock()
  }

  render() {
    return (
      <div>
        <Dialog
          title='Unlock wallet'
          actions={[
            <FlatButton onTouchTap={this.toggleDialog} label='Cancel' />,
            <FlatButton onTouchTap={this.unlock} primary={true} disabled={this.walletUnlock.button === false} label='Unlock wallet' />
          ]}
          autoScrollBodyContent={true}
          open={this.walletUnlock.dialog}
        >
          <TextField
            type='password'
            fullWidth={true}
            hintText='Wallet passphrase'
            errorText={this.walletUnlock.errors.incorrect && 'The passphrase you have entered is incorrect. Please try again.'}
            floatingLabelStyle={{fontWeight: 'normal'}}
            floatingLabelText='Enter wallet passphrase'
            onChange={this.setPassphrase}
          />
        </Dialog>
        <Snackbar
          open={this.walletUnlock.snackbar}
          message='Wallet has been unlocked.'
          action='Lock?'
          autoHideDuration={5 * 1000}
          onActionTouchTap={this.lock}
          onRequestClose={this.toggleSnackbar}
        />
      </div>
    )
  }
}

export default WalletUnlock
