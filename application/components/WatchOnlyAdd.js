import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

const WatchOnlyAdd = ({ state, addAddress, explorerLookup, setAddress, setNote, toggleDialog, toggleSnackbar }) => {
  const onAddClick = () => {
    addAddress(state.address, state.note)
    explorerLookup()
    toggleDialog()
    toggleSnackbar()
  }

  let errorText = null

  if (state.errors.alreadyAdded) { errorText = 'The address you have entered is already on your watch-only list.' }
  if (state.errors.invalid) { errorText = 'The address you have entered is not valid. Please double-check it.' }
  if (state.errors.isMine) { errorText = 'The address you have entered belongs to your wallet.' }

  const actions = [
    <FlatButton label='Cancel' onTouchTap={toggleDialog} />,
    <FlatButton label='Add watch-only address' onTouchTap={onAddClick} disabled={state.button === false} primary={true} />
  ]

  process.env.NODE_ENV === 'development' && console.log('%c' + '<WatchOnlyAdd />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title='Add watch-only address'
        actions={actions}
        modal={true}
        autoScrollBodyContent={true}
        open={state.dialogOpen}
      >
        <TextField
          onChange={setAddress}
          fullWidth={true}
          value={state.address}
          errorText={errorText}
          floatingLabelText='Address'
          hintText='Enter the address'
          underlineStyle={state.button ? {borderColor: 'green'} : {}}
        />
        <TextField
          onChange={setNote}
          hintText="Enter note"
          floatingLabelText="Note (optional)"
          value={state.note}
          fullWidth={true}
        />
      </Dialog>
      <Snackbar
        open={state.snackbarOpen}
        message={'Added watch-only address "' + state.address + '".'}
        autoHideDuration={5 * 1000}
        onRequestClose={toggleSnackbar}
      />
    </div>
  )
}

export default WatchOnlyAdd
