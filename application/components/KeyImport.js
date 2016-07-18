import React from 'react'
import AutoComplete from 'material-ui/AutoComplete'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

const KeyImport = ({ state, accounts, isLocked, keyImport, setAccount, setKey, toggleDialog, toggleSnackbar }) => {
  let errorAutoComplete = null
  let errorTextField = null

  if (state.errors.account.invalid) { errorAutoComplete = 'Account name can contain only alphanumerical characters and spaces.' }
  if (state.errors.key.alreadyImported) { errorTextField = 'The private key you have entered belongs to your wallet.' }
  if (state.errors.key.invalid) { errorTextField = 'The private key you have entered is invalid.' }

  const actions = [
    <FlatButton label='Cancel' onTouchTap={toggleDialog} />,
    <FlatButton label='Import private key' onTouchTap={keyImport} disabled={state.button === false || isLocked} primary={true} />
  ]

  process.env.NODE_ENV === 'development' && console.log('%c' + '<KeyImport />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title='Import private key'
        actions={actions}
        modal={true}
        autoScrollBodyContent={true}
        open={state.dialogOpen}
      >
        <TextField
          onChange={setKey}
          fullWidth={true}
          value={state.privateKey}
          errorText={errorTextField}
          floatingLabelText='Private key'
          hintText='Enter the private key'
        />
        <AutoComplete
          onNewRequest={setAccount}
          onUpdateInput={setAccount}
          searchText={state.account}
          errorText={errorAutoComplete}
          floatingLabelText="Assign to account"
          filter={AutoComplete.fuzzyFilter}
          maxSearchResults={5}
          openOnFocus={true}
          dataSource={accounts}
          fullWidth={true}
        />
      </Dialog>
      <Snackbar
        open={state.snackbarOpen}
        message={'Imported private key and assigned it to account "' + state.account + '".'}
        autoHideDuration={5 * 1000}
        onRequestClose={toggleSnackbar}
      />
    </div>
  )
}

export default KeyImport
