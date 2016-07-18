import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

const WalletEncrypt = ({ state, setPassphrase, setRepeat, toggleDialog, toggleSnackbar, walletEncrypt }) => {
  let errorText = null

  if (state.errors.different) { errorText = 'The passphrases you have entered do not match. Please double-check them.' }

  const actions = [
    <FlatButton onTouchTap={toggleDialog} label='Cancel' />,
    <FlatButton onTouchTap={walletEncrypt} primary={true} disabled={state.button === false} label='Encrypt wallet' />
  ]

  process.env.NODE_ENV === 'development' && console.log('%c' + '<WalletEncrypt />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title='Encrypt wallet'
        actions={actions}
        autoScrollBodyContent={true}
        open={state.dialogOpen}
      >
        <TextField
          onChange={setPassphrase}
          type='password'
          fullWidth={true}
          hintText='Your passphrase'
          errorText={errorText}
          floatingLabelStyle={{fontWeight:'normal'}}
          floatingLabelText='Enter wallet passphrase'
          underlineStyle={state.button ? {borderColor: 'green'} : {}}
        />
        <TextField
          onChange={setRepeat}
          floatingLabelStyle={{fontWeight:'normal'}}
          floatingLabelText='Repeat passphrase'
          type='password'
          fullWidth={true}
          hintText='Repeat passphrase'
          errorText={errorText}
          underlineStyle={state.button ? {borderColor: 'green'} : {}}
        />
      </Dialog>
      <Snackbar
        open={state.snackbarOpen}
        message="Wallet has been encrypted. Re-start the daemon."
        autoHideDuration={15 * 1000}
        onRequestClose={toggleSnackbar}
      />
    </div>
  )
}

export default WalletEncrypt
