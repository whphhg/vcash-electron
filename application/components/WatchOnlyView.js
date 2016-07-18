import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

import ClockIcon from 'material-ui/svg-icons/device/access-time'
import BalanceIcon from 'material-ui/svg-icons/action/account-balance'

import moment from 'moment'
import uuid from 'node-uuid'

const WatchOnlyView = ({ state, address, removeAddress, setNote, toggleDialog }) => {
  const onDeleteClick = () => {
    removeAddress(state.address)
    toggleDialog()
  }

  const actions = [
    <FlatButton label='Close' onTouchTap={toggleDialog} />,
    <FlatButton label='Delete' onTouchTap={onDeleteClick} primary={true} />
  ]

  process.env.NODE_ENV === 'development' && console.log('%c' + '<WatchOnlyEdit />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title={'Watching address ' + state.address}
        actions={actions}
        modal={false}
        autoScrollBodyContent={true}
        open={state.dialogOpen}
        onRequestClose={toggleDialog}
      >
        <div style={{fontSize:'14px',marginTop:'20px'}}>
          <BalanceIcon style={{height:'20px',float:'left'}}/>
          <p style={{float:'left',paddingLeft:'8px',margin:'0 0 1px'}}>Balance <b>{address.balance}</b> XVC</p>
          <div style={{clear:'both'}}></div>

          <ClockIcon style={{height:'20px',float:'left'}}/>
          <p style={{float:'left',paddingLeft:'8px',margin:'0 0 1px'}}>
            {address.lastUpdate === 0 ? 'Information has not been updated yet' : 'Last updated ' + moment().to(new Date(address.lastUpdate).toISOString())}.
          </p>
          <div style={{clear:'both'}}></div>
        </div>

        <TextField
          key={'watchonly-view-note'}
          onChange={setNote}
          hintText="Enter note"
          floatingLabelText="Note (optional)"
          value={address.note}
          fullWidth={true}
        />
      </Dialog>
    </div>
  )
}

export default WatchOnlyView
