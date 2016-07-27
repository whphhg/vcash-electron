import React from 'react'
import { inject, observer } from 'mobx-react'
import Snackbar from 'material-ui/Snackbar'

@inject('walletLock')
@inject('walletUnlock')
@observer

class WalletLock extends React.Component {
  constructor(props) {
    super(props)
    this.walletLock = props.walletLock
    this.walletUnlock = props.walletUnlock

    this.toggleDialog = this.toggleDialog.bind(this)
    this.toggleSnackbar = this.toggleSnackbar.bind(this)
  }

  toggleDialog() {
    this.walletUnlock.toggleDialog()
  }

  toggleSnackbar() {
    this.walletLock.toggleSnackbar()
  }

  render() {
    return (
      <Snackbar
        open={this.walletLock.snackbar}
        message="Wallet has been locked."
        action="Unlock?"
        autoHideDuration={3000}
        onActionTouchTap={this.toggleDialog}
        onRequestClose={this.toggleSnackbar}
      />
    )
  }
}

export default WalletLock
