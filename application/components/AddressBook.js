import React from 'react'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton/IconButton'
import IconMenu from 'material-ui/IconMenu'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NewAddressIcon from 'material-ui/svg-icons/image/blur-on'

import AddressNewContainer from '../containers/AddressNewContainer'
import KeyImportContainer from '../containers/KeyImportContainer'
import TransactionsChartContainer from '../containers/TransactionsChartContainer'
import WatchOnlyContainer from '../containers/WatchOnlyContainer'

import uuid from 'node-uuid'

const AddressBook = ({ state, addresses, balance, localCurrency, rate, showAccount, toggleAddressNew, toggleKeyImport, toggleWatchOnlyAdd }) => {
  // Sort by received descending.
  if (addresses.length > 0) {
    addresses = addresses.sort(function(a, b) {
      return parseInt(b.received) - parseInt(a.received)
    })
  }

  // Remove 'Default' account from account list.
  const accounts = state.accounts.filter((account) => {
    return account !== 'Default'
  })

  process.env.NODE_ENV === 'development' && console.log('%c' + '<AddressBook />', 'color:#673AB7')
  return (
    <div>
      <AddressNewContainer />
      <KeyImportContainer />

      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-6'>
            <div style={{float:'left'}}>
              <SelectField autoWidth={true} maxHeight={300} value={state.showAccount} onChange={showAccount} floatingLabelText='Showing account'>
                <MenuItem key={uuid.v4()} value='Default' primaryText='Default' />
                <Divider />
                {
                  accounts.map((account) => (
                    <MenuItem key={uuid.v4()} value={account} primaryText={account} />
                  ))
                }
              </SelectField>
            </div>
            <div style={{float:'left'}}>

              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                style={{marginTop:'27px'}}
              >
                <MenuItem style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Get new address" onTouchTap={toggleAddressNew} />
                <MenuItem style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Import private key" onTouchTap={toggleKeyImport} />
                <Divider />
                <MenuItem style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Dump private key" />
                <MenuItem style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Dump wallet" />
              </IconMenu>
            </div>

            <h5 style={{marginTop:'42px', float:'right'}}>{balance.toFixed(6)} XVC </h5>
            <div style={{clear:'both'}}></div>

            <Table height="265px" fixedHeader={true} showCheckboxes={false}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn style={{fontSize:'13px', width:'60%'}}>Addresses</TableHeaderColumn>
                  <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>Received</TableHeaderColumn>
                  <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>{localCurrency}</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                {
                  addresses.map((row) => (
                    <TableRow key={uuid.v4()} displayBorder={false}>
                      <TableRowColumn style={{width:'60%'}} className='font-mono'>{row.address}</TableRowColumn>
                      <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(row.received).toFixed(6)}</TableRowColumn>
                      <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(row.received * rate).toFixed(2) + ' ' + localCurrency}</TableRowColumn>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
          <div className='col-md-6'>
            <div className='text-right' style={{marginTop:'30px'}}>
              <FlatButton
                label='Add watch-only address'
                primary={true}
                onTouchTap={toggleWatchOnlyAdd}
              />
            </div>

            <WatchOnlyContainer />
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <TransactionsChartContainer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressBook
