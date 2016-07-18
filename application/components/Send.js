import React from 'react'
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

import CurrencyConverterContainer from '../containers/CurrencyConverterContainer'

const Send = ({ state, accounts, balance, isLocked, localCurrency, rate, newRecipient, removeRecipient, send, setAccount, setAddress, setAmount, toggleButton, toggleDrawer }) => {
  // Remove 'Default' account from account list.
  accounts = accounts.filter((account) => {
    return account !== 'Default'
  })

  process.env.NODE_ENV === 'development' && console.log('%c' + '<Send />', 'color:#673AB7')
  return (
    <div>
      <Drawer docked={true} width={750} open={state.isOpen} openSecondary={true}>
        <AppBar
          title={'Send'}
          iconElementLeft={<IconButton onTouchTap={toggleDrawer}><SendIcon color='#FFFFFF' /></IconButton>}
          children={
            <div className='row' style={{marginTop:'3px',color:'#FFF',width:'80%'}}>

              <div className='col-md-4 col-md-offset-1'>
                <h5>Total to send</h5>
                <h5>Remaining balance</h5>
              </div>

              <div className='col-md-4' style={{textAlign:'right'}}>
                <h5>- {parseFloat(state.total).toFixed(6)} XVC</h5>
                <h5>{(balance - parseFloat(state.total)).toFixed(6)} XVC</h5>
              </div>

              <div className='col-md-3' style={{textAlign:'right'}}>
                <h5>- {(parseFloat(state.total) * rate).toFixed(2) + ' ' + localCurrency}</h5>
                <h5>{((balance - parseFloat(state.total)) * rate).toFixed(2) + ' ' + localCurrency}</h5>
              </div>

            </div>
          }
        />

        <div className='container-fluid'>
          <div className='row' style={{marginTop:'7px'}}>
            <div className='recipients'>
              {
                state.recipients.map((row) => (
                  <div key={row.id}>
                    <div className='col-md-6'>
                      <TextField
                        id={'send-address_' + row.id}
                        onChange={setAddress}
                        fullWidth={true}
                        hintText='Recipient address'
                        errorText={row.isInvalid === true ? 'Invalid address' : null}
                        underlineStyle={row.isInvalid === false ? {borderColor: 'green'} : {}}
                        value={row.address}
                      />
                    </div>
                    <div className='col-md-6'>
                      <div className='col-md-5'>
                        <TextField
                          id={'send-amount_' + row.id}
                          onChange={setAmount}
                          fullWidth={true}
                          hintText='Amount'
                          value={row.amount}
                        />
                      </div>
                      <div className='col-md-5'>
                        <TextField
                          fullWidth={true}
                          disabled={true}
                          hintText={(row.amount * rate).toFixed(2) + ' ' + localCurrency}
                        />
                      </div>
                      <div className='col-md-2'>
                        <IconButton onTouchTap={removeRecipient.bind(null, row.id)}>
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
              { !state.btnSend &&
                (
                  <RaisedButton label='Send' onTouchTap={toggleButton} disabled={state.btnSendDisabled || isLocked} primary={true} />
                )
              }
              { state.btnSend &&
                (
                  <div>
                    <RaisedButton label='Back' onTouchTap={toggleButton} labelColor='#FFFFFF' backgroundColor='#424242' />
                    <RaisedButton label='Confirm' onTouchTap={send} style={{marginLeft:'10px'}} primary={true} />
                  </div>
                )
              }
            </div>

            <div className='col-md-8'>
              <RaisedButton
                label='New recipient'
                disabled={state.account === '#All'}
                style={{float:'right', marginLeft:'15px', marginTop:'28px'}}
                onTouchTap={newRecipient}
                primary={true}
              />
              <SelectField
                autoWidth={true}
                value={state.account}
                style={{float:'right'}}
                onChange={setAccount}
                floatingLabelText='Send from account'
              >
                <MenuItem key='#All' value='#All' disabled={state.recipients.length > 1} primaryText='Any account' />
                <MenuItem key='Default' value='Default' primaryText='Default' />
                <Divider />
                {
                  accounts.map((account) => (
                    <MenuItem key={account} value={account} primaryText={account} />
                  ))
                }
              </SelectField>
            </div>
          </div>

          <div className='row'>
            <div className='col-md-12' style={{marginTop:'10px'}}>
              { state.errors.insufficientBalance &&
                (
                  <h5>Account balance is too low to pay for the total with fees.</h5>
                )
              }
              { state.errors.insufficientFunds &&
                (
                  <h5>You have insufficient funds to pay for the total with fees.</h5>
                )
              }
              { state.errors.nonStandardTxType &&
                (
                  <h5>Nonstandard transaction type.</h5>
                )
              }
            </div>
          </div>

        </div>

        <Divider style={{clear:'both', marginTop:'0px', marginBottom:'0px'}} />
        <CurrencyConverterContainer />
      </Drawer>
    </div>
  )
}

export default Send
