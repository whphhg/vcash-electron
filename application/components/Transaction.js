import React from 'react'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconConfirmed from 'material-ui/svg-icons/action/done-all'
import IconUnconfirmed from 'material-ui/svg-icons/content/clear'
import IconLabel from 'material-ui/svg-icons/action/label'
import IconClock from 'material-ui/svg-icons/device/access-time'
import IconBlockhash from 'material-ui/svg-icons/action/extension'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

@inject('transaction')
@observer

class Transaction extends React.Component {
  constructor(props) {
    super(props)
    this.transaction = props.transaction
    this.amountTransacted = 0
    this.toggleDialog = this.toggleDialog.bind(this)

    if (this.transaction.data.hasOwnProperty('details')) {
      this.transaction.data.details.forEach((detail) => {
        this.amountTransacted += detail.amount
      })
    }
  }

  toggleDialog() {
    this.transaction.toggleDialog()
  }

  render() {
    return (
      <Dialog
        title={
          this.transaction.data.fee && 'Sent ' + this.amountTransacted.toFixed(6) + ' XVC with ' + Math.abs(this.transaction.data.fee) + ' XVC in fees'
          || 'Received ' + this.amountTransacted.toFixed(6) + ' XVC'
        }
        actions={<FlatButton onTouchTap={this.toggleDialog} primary={true} label='Close' />}
        modal={false}
        open={this.transaction.dialog}
        onRequestClose={this.toggleDialog}
        contentStyle={{width:'80%', maxWidth:'none'}}
        autoScrollBodyContent={true}
      >
        <div className='row'>
          <div className='col-md-12' style={{fontSize:'14px', marginTop:'20px'}}>
            <IconLabel style={{height:'20px', float:'left'}} />
            <p style={{float:'left', paddingLeft:'8px', margin:'0 0 1px'}}>Transaction ID <span className='font-weight-500'>{this.transaction.data.txid}</span></p>
            <div style={{clear:'both'}}></div>

            {
              this.transaction.data.blockhash &&
              (
                <div style={{marginBottom:'15px'}}>
                  <IconBlockhash style={{height:'20px', float:'left'}} />
                  <p style={{float:'left', paddingLeft:'8px', margin:'0 0 1px'}}>Blockhash <span className='font-weight-500'>{this.transaction.data.blockhash}</span></p>
                  <div style={{clear:'both'}}></div>
                </div>
              )
            }

            <IconClock color='#1B5E20' style={{height:'20px', float:'left'}} />
            <p style={{float:'left', paddingLeft:'8px', margin:'0 0 1px'}}>
              Relayed on <span className='font-weight-500'>{moment(new Date(this.transaction.data.time * 1000)).format('YYYY-MM-DD [at] HH:mm:ss')}</span></p>
            <div style={{clear:'both'}}></div>

            {
              this.transaction.data.blocktime &&
              (
                <div>
                  <IconClock color='#1B5E20' style={{height:'20px', float:'left'}} />
                  <p style={{float:'left', paddingLeft:'8px'}}>
                    Confirmed on <span className='font-weight-500'>{moment(new Date(this.transaction.data.blocktime * 1000)).format('YYYY-MM-DD [at] HH:mm:ss')}</span></p>
                  <div style={{clear:'both'}}></div>
                </div>
              )
            }

            <div style={{color:'' + this.transaction.data.confirmations > 0 ? '#1B5E20' : '#B71C1C' + ''}}>
              <IconConfirmed color={this.transaction.data.confirmations > 0 ? '#1B5E20' : '#B71C1C'} style={{height:'20px', float:'left'}} />
              <p style={{float:'left', paddingLeft:'8px'}}>
                <span className='font-weight-500'>{this.transaction.data.confirmations}</span> confirmations
              </p>
              <div style={{clear:'both'}}></div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='transaction'>
            <div className='col-md-6'>
              <Table fixedHeader={true} showCheckboxes={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn style={{fontSize:'13px', width:'70%'}}>Inputs</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px', width:'30%'}}>Amount</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                  {
                    this.transaction.data.hasOwnProperty('vin') && this.transaction.data.vin.map((row, index) => (
                      <TableRow key={index} displayBorder={false}>
                        <TableRowColumn className='font-mono' style={{width:'70%'}}>{row.details.address}</TableRowColumn>
                        <TableRowColumn style={{width:'30%'}}>{row.details.amount.toFixed(6)} XVC</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>

            <div className='col-md-6'>
              <Table fixedHeader={true} showCheckboxes={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn style={{fontSize:'13px', width:'70%'}}>Outputs</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px', width:'30%'}}>Amount</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                  {
                    this.transaction.data.hasOwnProperty('vout') && this.transaction.data.vout.map((row, index) => {
                      if (row.isRemainder) {
                        return (
                          <TableRow key={index} displayBorder={false} style={{background:'#FFF9C4'}}>
                            <TableRowColumn className='font-mono' style={{width:'70%'}}>{row.scriptPubKey.addresses[0]}</TableRowColumn>
                            <TableRowColumn style={{width:'30%'}}>{row.value.toFixed(6)} XVC</TableRowColumn>
                          </TableRow>
                        )
                      } else {
                        return (
                          <TableRow key={index} displayBorder={false} style={{background:'#C8E6C9'}}>
                            <TableRowColumn className='font-mono' style={{width:'70%'}}>{row.scriptPubKey.addresses[0]}</TableRowColumn>
                            <TableRowColumn style={{width:'30%'}}>{row.value.toFixed(6)} XVC</TableRowColumn>
                          </TableRow>
                        )
                      }
                    })
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default Transaction
