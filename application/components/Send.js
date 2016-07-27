import React from 'react'
import { inject, observer } from 'mobx-react'

import AppBar from 'material-ui/AppBar'
import Divider from 'material-ui/Divider'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'
import CancelIcon from 'material-ui/svg-icons/content/clear'
import ConfirmIcon from 'material-ui/svg-icons/action/done'
import RemoveIcon from 'material-ui/svg-icons/action/delete-forever'
import SendIcon from 'material-ui/svg-icons/content/send'

import CurrencyConverter from './CurrencyConverter'

@inject('addressBook')
@inject('send')
@inject('rates')
@inject('wallet')
@observer

class Send extends React.Component {
  constructor(props) {
    super(props)
    this.addressBook = props.addressBook
    this.send = props.send
    this.rates = props.rates
    this.wallet = props.wallet

    this.confirm = this.confirm.bind(this)
    this.addRecipient = this.addRecipient.bind(this)
    this.removeRecipient = this.removeRecipient.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setAddress = this.setAddress.bind(this)
    this.setAmount = this.setAmount.bind(this)
    this.toggleButton = this.toggleButton.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
  }

  confirm() {
    this.send.confirm()
  }

  addRecipient() {
    this.send.addRecipient()
  }

  removeRecipient(id) {
    this.send.removeRecipient(id)
  }

  setAccount(event, index, value) {
    this.send.setAccount(value)
  }

  setAddress(event) {
    const id = event.target.id.split('_')[1]
    const address = event.target.value
    this.send.setAddress(id, address)
  }

  setAmount(event) {
    const id = event.target.id.split('_')[1]
    const amount = event.target.value
    this.send.setAmount(id, amount)
  }

  toggleButton() {
    this.send.toggleButton()
  }

  toggleDrawer() {
    this.send.toggleDrawer()
  }

  render() {
    return (
      <Drawer docked={true} width={750} open={this.send.drawer} openSecondary={true}>
        <AppBar
          title={'Send'}
          iconElementLeft={<IconButton onTouchTap={this.toggleDrawer}><SendIcon color='#FFFFFF' /></IconButton>}
          children={
            <div className='row' style={{marginTop:'3px',color:'#FFF',width:'80%'}}>
              <div className='col-md-4 col-md-offset-1'>
                <h5>Total to send</h5>
                <h5>Remaining balance</h5>
              </div>
              <div className='col-md-4' style={{textAlign:'right'}}>
                <h5>{parseFloat(this.send.total).toFixed(6)} XVC</h5>
                <h5>{(this.addressBook.byAccount[this.send.fromAccount].balance - parseFloat(this.send.total)).toFixed(6)} XVC</h5>
              </div>
              <div className='col-md-3' style={{textAlign:'right'}}>
                <h5>{(parseFloat(this.send.total) * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}</h5>
                <h5>{((this.addressBook.byAccount[this.send.fromAccount].balance - parseFloat(this.send.total)) * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}</h5>
              </div>
            </div>
          }
        />

        <div className='container-fluid'>
          <div className='row' style={{marginTop:'7px'}}>
            <div className='recipients'>
              {
                this.send.recipients.map((row) => (
                  <div key={row.id}>
                    <div className='col-md-6'>
                      <TextField
                        id={'send-address_' + row.id}
                        onChange={this.setAddress}
                        fullWidth={true}
                        hintText='Recipient address'
                        errorText={row.validAddress === false ? 'Invalid address' : null}
                        underlineStyle={row.validAddress === true ? {borderColor: 'green'} : {}}
                        value={row.address}
                      />
                    </div>
                    <div className='col-md-6'>
                      <div className='col-md-5'>
                        <TextField
                          id={'send-amount_' + row.id}
                          onChange={this.setAmount}
                          fullWidth={true}
                          hintText='Amount'
                          value={row.amount}
                        />
                      </div>
                      <div className='col-md-5'>
                        <TextField
                          fullWidth={true}
                          disabled={true}
                          hintText={(row.amount * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}
                        />
                      </div>
                      <div className='col-md-2'>
                        <IconButton onTouchTap={this.removeRecipient.bind(null, row.id)} disabled={this.send.recipients.length === 1}>
                          <RemoveIcon />
                        </IconButton>
                      </div>
                    </div>
                    <div style={{clear:'both'}}></div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className='row'>
            <div className='col-md-4' style={{marginTop:'28px'}}>
              {
                !this.send.buttonPressed &&
                (
                  <RaisedButton label='Send' onTouchTap={this.toggleButton} disabled={this.send.button === false || this.wallet.isLocked} primary={true} />
                )
              }
              {
                this.send.buttonPressed &&
                (
                  <div>
                    <RaisedButton label='Back' onTouchTap={this.toggleButton} labelColor='#FFFFFF' backgroundColor='#424242' />
                    <RaisedButton label='Confirm' onTouchTap={this.confirm} style={{marginLeft:'10px'}} primary={true} />
                  </div>
                )
              }
            </div>

            <div className='col-md-8'>
              <RaisedButton
                label='New recipient'
                disabled={this.send.fromAccount === '#All'}
                style={{float:'right', marginLeft:'15px', marginTop:'28px'}}
                onTouchTap={this.addRecipient}
                primary={true}
              />
              <SelectField
                autoWidth={true}
                value={this.send.fromAccount}
                style={{float:'right'}}
                onChange={this.setAccount}
                floatingLabelText='Send from account'
              >
                <MenuItem key='#All' value='#All' disabled={this.send.recipients.length > 1} primaryText='Any account' />
                <MenuItem key='Default' value='Default' primaryText='Default' />
                <Divider />
                {
                  this.addressBook.accountList.map((account) => (
                    <MenuItem key={account} value={account} primaryText={account} />
                  ))
                }
              </SelectField>
            </div>
          </div>

          <div className='row'>
            <div className='col-md-12' style={{marginTop:'10px'}}>
              { this.send.errors.insufficientBalance && (<h5>Account balance is too low to pay for the total with fees.</h5>) }
              { this.send.errors.insufficientFunds && (<h5>You have insufficient funds to pay for the total with fees.</h5>) }
              { this.send.errors.nonStandardTxType && (<h5>Nonstandard transaction type.</h5>) }
              { this.send.errors.duplicateAddress && (<h5>You attempted to enter a duplicate address.</h5>) }
            </div>
          </div>

        </div>

        <Divider style={{clear:'both', marginTop:'0px', marginBottom:'0px'}} />
        <CurrencyConverter />
      </Drawer>
    )
  }
}

export default Send
