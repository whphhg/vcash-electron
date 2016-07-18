import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

const WalletUnlock = ({ state, setPassphrase, toggleDialog, toggleSnackbar, walletLock, walletUnlock }) => {
  let errorText = null

  if (state.errors.incorrect) { errorText = 'The passphrase you have entered is incorrect. Please try again.' }

  const actions = [
    <FlatButton onTouchTap={toggleDialog} label='Cancel' />,
    <FlatButton onTouchTap={walletUnlock} primary={true} disabled={state.button === false} label='Unlock wallet' />
  ]

  process.env.NODE_ENV === 'development' && console.log('%c' + '<WalletUnlock />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title='Unlock wallet'
        actions={actions}
        autoScrollBodyContent={true}
        open={state.dialogOpen}
      >
        <TextField
          type='password'
          fullWidth={true}
          hintText='Wallet passphrase'
          errorText={errorText}
          floatingLabelStyle={{fontWeight:'normal'}}
          floatingLabelText='Enter wallet passphrase'
          onChange={setPassphrase}
        />
      </Dialog>
      <Snackbar
        open={state.snackbarOpen}
        message="Wallet has been unlocked."
        action="Lock?"
        autoHideDuration={5 * 1000}
        onActionTouchTap={walletLock}
        onRequestClose={toggleSnackbar}
      />
    </div>
  )
}

export default WalletUnlock
