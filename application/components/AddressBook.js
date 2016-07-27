import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
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

import AddressNew from './AddressNew'
import KeyImport from './KeyImport'
import TransactionsChart from './TransactionsChart'
import WatchOnly from './WatchOnly'

@inject('addressBook')
@inject('addressNew')
@inject('keyImport')
@inject('rates')
@inject('wallet')
@inject('watchOnlyAdd')
@observer

class AddressBook extends React.Component {
  constructor(props) {
    super(props)
    this.addressBook = props.addressBook
    this.addressNew = props.addressNew
    this.keyImport = props.keyImport
    this.rates = props.rates
    this.wallet = props.wallet
    this.watchOnlyAdd = props.watchOnlyAdd

    this.setShowAccount = this.setShowAccount.bind(this)
    this.toggleAddressNew = this.toggleAddressNew.bind(this)
    this.toggleKeyImport = this.toggleKeyImport.bind(this)
    this.toggleWatchOnlyAdd = this.toggleWatchOnlyAdd.bind(this)
  }

  setShowAccount(event, index, value) {
    this.addressBook.setShowAccount(value)
  }

  toggleAddressNew() {
    this.addressNew.toggleDialog()
  }

  toggleKeyImport() {
    this.keyImport.toggleDialog()
  }

  toggleWatchOnlyAdd() {
    this.watchOnlyAdd.toggleDialog()
  }

  render() {
    return (
      <div>
        <AddressNew />
        <KeyImport />

        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-6'>
              <div style={{float:'left'}}>
                <SelectField
                  autoWidth={true}
                  maxHeight={300}
                  value={this.addressBook.showAccount}
                  onChange={this.setShowAccount}
                  floatingLabelText='Showing account'
                >
                  <MenuItem key={v4()} value='Default' primaryText='Default' />
                  <Divider />
                  {
                    this.addressBook.accountList.map((account) => (
                      <MenuItem key={v4()} value={account} primaryText={account} />
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
                  <MenuItem onTouchTap={this.toggleAddressNew} style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Get new address" />
                  <MenuItem onTouchTap={this.toggleKeyImport} disabled={this.wallet.isLocked} style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Import private key" />
                  <Divider />
                  <MenuItem disabled={true} style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Dump private key" />
                  <MenuItem disabled={true} style={{lineHeight:'32px', fontSize:'15px'}} primaryText="Dump wallet" />
                </IconMenu>
              </div>

              <h5 style={{marginTop:'42px', float:'right'}}>{this.addressBook.showAccountBalance.toFixed(6)} XVC </h5>
              <div style={{clear:'both'}}></div>

              <Table height="265px" fixedHeader={true} showCheckboxes={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn style={{fontSize:'13px', width:'60%'}}>Addresses</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>Received</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>{this.rates.localCurrency}</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                  {
                    this.addressBook.showAccountAddresses.map((row) => (
                      <TableRow key={v4()} displayBorder={false}>
                        <TableRowColumn style={{width:'60%'}} className='font-mono'>{row.address}</TableRowColumn>
                        <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(row.received).toFixed(6)}</TableRowColumn>
                        <TableRowColumn style={{textAlign:'right', width:'20%'}}>{parseFloat(row.received * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}</TableRowColumn>
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
                  onTouchTap={this.toggleWatchOnlyAdd}
                />
              </div>

              <WatchOnly />
            </div>
          </div>
          <div className='row'>
            <div className='col-md-12'>
              <TransactionsChart />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AddressBook
