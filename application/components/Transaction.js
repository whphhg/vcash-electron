import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import IconConfirmed from 'material-ui/svg-icons/action/done-all'
import IconUnconfirmed from 'material-ui/svg-icons/content/clear'
import IconLabel from 'material-ui/svg-icons/action/label'
import IconClock from 'material-ui/svg-icons/device/access-time'
import IconBlockhash from 'material-ui/svg-icons/action/extension'

import moment from 'moment'

const Transaction = ({ transaction, toggleDialog }) => {
  let amountTransacted = 0

  if (transaction.result.hasOwnProperty('details')) {
    transaction.result.details.forEach((detail) => {
      amountTransacted += detail.amount
    })
  }

  let titleString = ''

  // Handle different cases of tx (sent/received/staked/generated).
  if (transaction.result.fee) {
    titleString = 'Sent ' + amountTransacted.toFixed(6) + ' XVC with ' + Math.abs(transaction.result.fee) + ' XVC in fees'
  } else {
    titleString = 'Received ' + amountTransacted.toFixed(6) + ' XVC'
  }


  process.env.NODE_ENV === 'development' && console.log('%c' + '<Transaction />', 'color:#673AB7')
  return (
    <div>
      <Dialog
        title={titleString}
        actions={<FlatButton onTouchTap={toggleDialog} primary={true} label='Close' />}
        modal={false}
        open={transaction.isOpen}
        onRequestClose={toggleDialog}
        contentStyle={{width:'80%', maxWidth:'none'}}
        autoScrollBodyContent={true}
      >
        <div className='row'>
          <div className='col-md-12' style={{fontSize:'14px',marginTop:'20px'}}>
            <IconLabel style={{height:'20px',float:'left'}}/>
            <p style={{float:'left',paddingLeft:'8px',margin:'0 0 1px'}}>Transaction ID <b>{transaction.result.txid}</b></p>
            <div style={{clear:'both'}}></div>

            { transaction.result.blockhash && (
              <div style={{marginBottom:'15px'}}>
                <IconBlockhash style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',margin: '0 0 1px'}}>Blockhash <b>{transaction.result.blockhash}</b></p>
                <div style={{clear:'both'}}></div>
              </div>
            ) }

            <IconClock color='#1B5E20' style={{height:'20px',float:'left'}}/>
            <p style={{float:'left',paddingLeft:'8px',margin: '0 0 1px'}}>Relayed on {moment(new Date(transaction.result.time * 1000)).format('YYYY-MM-DD [at] HH:mm:ss')}</p>
            <div style={{clear:'both'}}></div>

            { transaction.result.blocktime && (
              <div>
                <IconClock color='#1B5E20' style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px'}}>Confirmed on {moment(new Date(transaction.result.blocktime * 1000)).format('YYYY-MM-DD [at] HH:mm:ss')}</p>
                <div style={{clear:'both'}}></div>
              </div>
            ) }

            { transaction.result.confirmations > 0 && (
              <div>
                <IconConfirmed color='#1B5E20' style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',color:'#1B5E20'}}><b>{transaction.result.confirmations}</b> confirmations</p>
                <div style={{clear:'both'}}></div>
              </div>
            ) }

            { transaction.result.confirmations === 0 && (
              <div>
                <IconUnconfirmed color='#B71C1C' style={{height:'20px',float:'left'}}/>
                <p style={{float:'left',paddingLeft:'8px',color:'#B71C1C'}}><b>{transaction.result.confirmations}</b> confirmations</p>
                <div style={{clear:'both'}}></div>
              </div>
            ) }
          </div>
        </div>

        <div className='row'>
          <div className='transaction'>
            <div className='col-md-6'>
              <Table fixedHeader={true} showCheckboxes={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn style={{fontSize:'13px',width:'70%'}}>Inputs</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px',width:'30%'}}>Amount</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                  {
                    transaction.result.hasOwnProperty('vin') && transaction.result.vin.map((row, index) => (
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
                    <TableHeaderColumn style={{fontSize:'13px',width:'70%'}}>Outputs</TableHeaderColumn>
                    <TableHeaderColumn style={{fontSize:'13px',width:'30%'}}>Amount</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                  {
                    transaction.result.hasOwnProperty('vout') && transaction.result.vout.map((row, index) => {
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
    </div>
  )
}

export default Transaction
