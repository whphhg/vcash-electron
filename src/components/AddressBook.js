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
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NewAddressIcon from 'material-ui/svg-icons/image/blur-on'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import AddressNew from './AddressNew'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'

@inject('addressBook')
@inject('addressNew')
@inject('network')
@inject('keyDump')
@inject('keyImport')
@inject('rates')
@inject('wallet')
@observer

class AddressBook extends React.Component {
  constructor(props) {
    super(props)
    this.addressBook = props.addressBook
    this.addressNew = props.addressNew
    this.keyDump = props.keyDump
    this.keyImport = props.keyImport
    this.network = props.network
    this.rates = props.rates
    this.wallet = props.wallet

    this.setShowAccount = this.setShowAccount.bind(this)
    this.toggleAddressNew = this.toggleAddressNew.bind(this)
    this.toggleKeyDump = this.toggleKeyDump.bind(this)
    this.toggleKeyImport = this.toggleKeyImport.bind(this)
  }

  setShowAccount(event, index, value) {
    this.addressBook.setShowAccount(value)
  }

  toggleAddressNew() {
    this.addressNew.toggleDialog()
  }

  toggleKeyDump() {
    this.keyDump.toggleDialog()
  }

  toggleKeyImport() {
    this.keyImport.toggleDialog()
  }

  render() {
    return (
      <div>
        <AddressNew />
        <KeyDump />
        <KeyImport />

        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-6'>

              <h5 style={{marginTop:'20px'}}>Incentive information</h5>
              <i className='material-icons md-20' style={{float:'left'}}>library_books</i>
              <p style={{float:'left', paddingLeft:'8px', margin:'0px'}}>
                Default wallet address <span className='font-weight-500'>{this.network.incentive.walletaddress === '' ? 'will be revealed after unlocking' : this.network.incentive.walletaddress}</span>
              </p>
              <div style={{clear:'both'}}></div>

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
                  anchorOrigin={{horizontal:'left', vertical:'top'}}
                  targetOrigin={{horizontal:'left', vertical:'top'}}
                  style={{marginTop:'27px'}}
                >
                  <MenuItem onTouchTap={this.toggleAddressNew} style={{lineHeight:'32px', fontSize:'15px'}} primaryText='Get new address' />
                  <MenuItem onTouchTap={this.toggleKeyImport} disabled={this.wallet.isLocked} style={{lineHeight:'32px', fontSize:'15px'}} primaryText='Import private key' />
                  <Divider />
                  <MenuItem onTouchTap={this.toggleKeyDump} disabled={this.wallet.isLocked} style={{lineHeight:'32px', fontSize:'15px'}} primaryText='Dump private key' />
                  <MenuItem disabled={true} style={{lineHeight:'32px', fontSize:'15px'}} primaryText='Dump wallet' />
                </IconMenu>
              </div>

              <h5 style={{marginTop:'42px', float:'right'}}>{this.addressBook.showAccountBalance.toFixed(6)} XVC</h5>
              <div style={{clear:'both'}}></div>

              <Table height='265px' fixedHeader={true} showCheckboxes={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn style={{fontSize:'13px', width:'60%'}}>Addresses</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>Received</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px', width:'20%'}}>{this.rates.localCurrency}</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                  {
                    this.addressBook.showAccountAddresses.map((address) => (
                      <TableRow key={v4()} displayBorder={false}>
                        <TableRowColumn style={{width:'60%'}} className='font-mono'>
                          {address.address}
                        </TableRowColumn>
                        <TableRowColumn style={{textAlign:'right', width:'20%'}}>
                          {parseFloat(address.received).toFixed(6)}
                        </TableRowColumn>
                        <TableRowColumn style={{textAlign:'right', width:'20%'}}>
                          {parseFloat(address.received * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}
                        </TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AddressBook
