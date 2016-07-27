import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
import moment from 'moment'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import ClockIcon from 'material-ui/svg-icons/device/access-time'
import BalanceIcon from 'material-ui/svg-icons/action/account-balance'

import WatchOnlyAdd from './WatchOnlyAdd'

@inject('rates')
@inject('watchOnly')
@observer

class WatchOnly extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.watchOnly = props.watchOnly

    this.setNote = this.setNote.bind(this)
    this.setViewingAddress = this.setViewingAddress.bind(this)
    this.removeAddress = this.removeAddress.bind(this)
    this.toggleViewingDialog = this.toggleViewingDialog.bind(this)
  }

  setNote(event) {
    this.watchOnly.editAddress(event.target.value)
  }

  setViewingAddress(rowNumber, columndId) {
    this.watchOnly.setViewingAddress(this.watchOnly.addressList[rowNumber])
    this.watchOnly.toggleViewingDialog()
  }

  removeAddress() {
    this.watchOnly.removeAddress()
    this.watchOnly.toggleViewingDialog()
  }

  toggleViewingDialog() {
    this.watchOnly.toggleViewingDialog()
  }

  render() {
    return (
      <div style={{marginTop:'6px'}}>
        <WatchOnlyAdd />

        <Table height="265px" fixedHeader={true} showCheckboxes={false} onCellClick={this.setViewingAddress}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={{fontSize:'13px', width:'60%'}}>Watch-only addresses</TableHeaderColumn>
              <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>Balance</TableHeaderColumn>
              <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>{this.rates.localCurrency}</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
            {
              this.watchOnly.addressList.map((entry) => (
                <TableRow key={v4()} displayBorder={false}>
                  <TableRowColumn style={{width:'60%'}} className='font-mono'>{this.watchOnly.addresses[entry].address}</TableRowColumn>
                  <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(this.watchOnly.addresses[entry].balance).toFixed(6)}</TableRowColumn>
                  <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(this.watchOnly.addresses[entry].balance * this.rates.local * this.rates.average).toFixed(2) + ' ' + this.rates.localCurrency}</TableRowColumn>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>

        {
          this.watchOnly.viewingAddress !== '' &&
          (
            <Dialog
              title={'Watching address ' + this.watchOnly.viewingAddress}
              actions={[
                <FlatButton label='Close' onTouchTap={this.toggleViewingDialog} />,
                <FlatButton label='Delete' onTouchTap={this.removeAddress} primary={true} />
              ]}
              modal={false}
              autoScrollBodyContent={true}
              open={this.watchOnly.viewingDialog}
              onRequestClose={this.toggleViewingDialog}
            >
              <div style={{fontSize:'14px',marginTop:'20px'}}>
                <BalanceIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0 0 1px'}}>Balance <b>{this.watchOnly.viewingAddressData.balance}</b> XVC</p>
                <div style={{clear:'both'}}></div>

                <ClockIcon style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin:'0 0 1px'}}>
                  {this.watchOnly.viewingAddressData.lastUpdate === 0 ? 'Information has not been updated yet' : 'Last updated ' + moment().to(new Date(this.watchOnly.viewingAddressData.lastUpdate).toISOString())}.
                </p>
                <div style={{clear:'both'}}></div>
              </div>

              <TextField
                key={'watchonly-view-note'}
                onChange={this.setNote}
                hintText="Enter note"
                floatingLabelText="Note (optional)"
                value={this.watchOnly.viewingAddressData.note}
                fullWidth={true}
              />
            </Dialog>
          )
        }

      </div>
    )
  }
}

export default WatchOnly
