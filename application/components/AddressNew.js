import React from 'react'
import AutoComplete from 'material-ui/AutoComplete'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'

const AddressNew = ({ state, accounts, addressNew, setAccount, toggleDialog, toggleSnackbar }) => {
  let errorText = null

  if (state.errors.invalid) { errorText = 'Account name can contain only alphanumerical characters and spaces.' }

  const actions = [
    <FlatButton label='Cancel' onTouchTap={toggleDialog} />,
    <FlatButton label='Get new address' onTouchTap={addressNew} disabled={state.button === false} primary={true} />
  ]

  process.env.NODE_ENV === 'development' && console.log('%c' + '<AddressNew />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title='Assign your new address to an account'
        actions={actions}
        modal={true}
        autoScrollBodyContent={true}
        open={state.dialogOpen}
      >
        <AutoComplete
          onNewRequest={setAccount}
          onUpdateInput={setAccount}
          searchText={state.account}
          errorText={errorText}
          floatingLabelText="Assign to account"
          filter={AutoComplete.fuzzyFilter}
          maxSearchResults={5}
          dataSource={accounts}
          fullWidth={true}
        />
      </Dialog>
      <Snackbar
        open={state.snackbarOpen}
        message={'New address added to account "' + state.account + '".'}
        autoHideDuration={5 * 1000}
        onRequestClose={toggleSnackbar}
      />
    </div>
  )
}

export default AddressNew
