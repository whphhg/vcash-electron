import React from 'react'
import { inject, observer } from 'mobx-react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'

@inject('watchOnly')
@inject('watchOnlyAdd')
@observer

class WatchOnlyAdd extends React.Component {
  constructor(props) {
    super(props)
    this.watchOnly = props.watchOnly
    this.watchOnlyAdd = props.watchOnlyAdd

    this.addAddress = this.addAddress.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.setNote = this.setNote.bind(this)
    this.toggleDialog = this.toggleDialog.bind(this)
    this.toggleSnackbar = this.toggleSnackbar.bind(this)
  }

  addAddress() {
    this.watchOnly.addAddress(this.watchOnlyAdd.address, this.watchOnlyAdd.note)
    this.watchOnlyAdd.toggleDialog()
    this.watchOnlyAdd.toggleSnackbar()
  }

  setAddress(event) {
    this.watchOnlyAdd.setAddress(event.target.value)
  }

  setNote(event) {
    this.watchOnlyAdd.setNote(event.target.value)
  }

  toggleDialog() {
    this.watchOnlyAdd.toggleDialog()
  }

  toggleSnackbar() {
    this.watchOnlyAdd.toggleSnackbar()
  }

  render() {
    return (
      <div>
        <Dialog
          title='Add watch-only address'
          actions={[
            <FlatButton label='Cancel' onTouchTap={this.toggleDialog} />,
            <FlatButton label='Add watch-only address' onTouchTap={this.addAddress} disabled={this.watchOnlyAdd.button === false} primary={true} />
          ]}
          modal={true}
          autoScrollBodyContent={true}
          open={this.watchOnlyAdd.dialog}
        >
          <TextField
            onChange={this.setAddress}
            fullWidth={true}
            value={this.watchOnlyAdd.address}
            errorText={
              this.watchOnlyAdd.errors.alreadyAdded && 'The address you have entered is already on your watch-only list.'
              || this.watchOnlyAdd.errors.invalid && 'The address you have entered is not valid. Please double-check it.'
              || this.watchOnlyAdd.errors.isMine && 'The address you have entered belongs to your wallet.'
            }
            floatingLabelText='Address'
            hintText='Enter the address'
            underlineStyle={this.watchOnlyAdd.button ? {borderColor: 'green'} : {}}
          />
          <TextField
            onChange={this.setNote}
            hintText="Enter note"
            floatingLabelText="Note (optional)"
            value={this.watchOnlyAdd.note}
            fullWidth={true}
          />
        </Dialog>
        <Snackbar
          open={this.watchOnlyAdd.snackbar}
          message={'Added watch-only address "' + this.watchOnlyAdd.address + '".'}
          autoHideDuration={5 * 1000}
          onRequestClose={this.toggleSnackbar}
        />
      </div>
    )
  }
}

export default WatchOnlyAdd
