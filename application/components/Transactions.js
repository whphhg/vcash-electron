import React from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import TransactionsFilterContainer from '../containers/TransactionsFilterContainer'
import TransactionsShowCategoryContainer from '../containers/TransactionsShowCategoryContainer'
import TransactionsShowSinceContainer from '../containers/TransactionsShowSinceContainer'

import moment from 'moment'
import uuid from 'node-uuid'

// TODO: Colorize amounts according to category.
// TODO: Switch table to FixedDataTable (performance).
const Transactions = ({ transactions, localCurrency, toggleDialog }) => {
  const onTxClick = (rowNumber, columndId) => {
    const txid = transactions[rowNumber].txid
    toggleDialog(txid)
  }

  process.env.NODE_ENV === 'development' && console.log('%c' + '<Transactions />', 'color:#673AB7')
  return (
    <div>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='row'>
              <div className='col-md-2'>
                <TransactionsShowCategoryContainer />
              </div>
              <div className='col-md-4' style={{marginTop:'24px'}}>
                <TransactionsShowSinceContainer />
              </div>
              <div className='col-md-6 text-right'>
                <TransactionsFilterContainer />
              </div>
            </div>
            <div className='row' style={{marginTop:'20px'}}>
              <div className='col-md-12'>
                <Table height="530px" fixedHeader={true} showCheckboxes={false} onCellClick={onTxClick}>
                  <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                      <TableHeaderColumn style={{ fontSize:'13px', width: '13%' }}>Date</TableHeaderColumn>
                      <TableHeaderColumn style={{ fontSize:'13px', width: '21%' }}>Account</TableHeaderColumn>
                      <TableHeaderColumn style={{ fontSize:'13px', width: '26%' }}>Address</TableHeaderColumn>
                      <TableHeaderColumn style={{ fontSize:'13px', width: '16%' }}>Category</TableHeaderColumn>
                      <TableHeaderColumn style={{ fontSize:'13px', width: '12%' }}>Amount</TableHeaderColumn>
                      <TableHeaderColumn style={{ fontSize:'13px', width: '12%' }}>{ localCurrency }</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody deselectOnClickaway={true} showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                    {
                      transactions.map((row) => (
                        <TableRow key={uuid.v4()} displayBorder={false} selected={row.selected}>
                          <TableRowColumn style={{ width:'13%' }}>{ moment(new Date(row.time * 1000)).format('YYYY-MM-DD - HH:mm:ss') }</TableRowColumn>
                          <TableRowColumn style={{ width:'21%' }}>{ row.account }</TableRowColumn>
                          <TableRowColumn style={{ width:'26%' }} className='font-mono'>{ row.address }</TableRowColumn>
                          <TableRowColumn style={{ textAlign:'right', width:'16%' }}>{ row.category }</TableRowColumn>
                          <TableRowColumn style={{ textAlign:'right', width:'12%' }}>{ parseFloat(row.amount).toFixed(6) }</TableRowColumn>
                          <TableRowColumn style={{ textAlign:'right', width:'12%' }}>{ parseFloat(row.amountLocal).toFixed(2) + ' ' + localCurrency }</TableRowColumn>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transactions
