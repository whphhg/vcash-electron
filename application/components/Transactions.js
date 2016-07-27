import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
import moment from 'moment'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import DatePicker from 'material-ui/DatePicker'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'

/**
 * TODO: Colorize amounts according to category.
 * TODO: Switch table to FixedDataTable (performance).
 */
@inject('transaction')
@inject('transactions')
@inject('rates')
@observer

class Transactions extends React.Component {
  constructor(props) {
    super(props)
    this.transaction = props.transaction
    this.transactions = props.transactions
    this.rates = props.rates
    this.filtersUpdateTimer = null

    this.onCellClick = this.onCellClick.bind(this)
    this.setFilters = this.setFilters.bind(this)
    this.setShowCategory = this.setShowCategory.bind(this)
    this.setShowSince = this.setShowSince.bind(this)
  }

  onCellClick(rowNumber, columndId) {
    const txid = this.transactions.filtered[rowNumber].txid
    this.transaction.setTxid(txid)
    this.transaction.toggleDialog()
  }

  setFilters(event) {
    clearTimeout(this.filtersUpdateTimer)
    const filter = event.target.value

    this.filtersUpdateTimer = setTimeout(() => {
      this.transactions.setFilters(filter)
    }, 0.5 * 1000)
  }

  setShowCategory(event, index, value) {
    this.transactions.setShowCategory(value)
  }

  setShowSince(empty, since) {
    this.transactions.setShowSince(since)
  }

  render() {
    return (
      <div>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='row'>
                <div className='col-md-2'>
                  <SelectField onChange={this.setShowCategory} value={this.transactions.showCategory} autoWidth={true} floatingLabelText='Showing' style={{width:'150px'}}>
                    <MenuItem key={1} value='all' primaryText='All' />
                    <MenuItem key={2} value='receive' primaryText='Received' />
                    <MenuItem key={3} value='send' primaryText='Sent' />
                    <MenuItem key={4} value='blended' primaryText='Blended' />
                    <MenuItem key={5} value='generate' primaryText='Generated' />
                    <MenuItem key={6} value='immature' primaryText='Immature' />
                  </SelectField>
                </div>
                <div className='col-md-4' style={{marginTop:'24px'}}>
                  <DatePicker
                    textFieldStyle={{width:'150px'}}
                    hintText='Show transactions since'
                    container='inline'
                    mode='landscape'
                    defaultDate={this.transactions.showSince}
                    maxDate={new Date()}
                    onChange={this.setShowSince}
                  />
                </div>
                <div className='col-md-6 text-right'>
                  <TextField
                    hintText='by blockhash, txid or any of the columns below'
                    style={{width:'350px'}}
                    floatingLabelStyle={{fontWeight:'normal'}}
                    floatingLabelText='Filter transactions'
                    onChange={this.setFilters}
                  />
                </div>
              </div>
              <div className='row' style={{marginTop:'20px'}}>
                <div className='col-md-12'>
                  <Table height='480px' fixedHeader={true} showCheckboxes={false} onCellClick={this.onCellClick}>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                      <TableRow>
                        <TableHeaderColumn style={{fontSize:'13px', width: '13%'}}>Date</TableHeaderColumn>
                        <TableHeaderColumn style={{fontSize:'13px', width: '21%'}}>Account</TableHeaderColumn>
                        <TableHeaderColumn style={{fontSize:'13px', width: '26%'}}>Address</TableHeaderColumn>
                        <TableHeaderColumn style={{fontSize:'13px', width: '16%'}}>Category</TableHeaderColumn>
                        <TableHeaderColumn style={{fontSize:'13px', width: '12%'}}>Amount</TableHeaderColumn>
                        <TableHeaderColumn style={{fontSize:'13px', width: '12%'}}>{this.rates.localCurrency}</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody deselectOnClickaway={true} showRowHover={true} stripedRows={true} displayRowCheckbox={false}>
                      {
                        this.transactions.filtered.map((tx) => (
                          <TableRow key={v4()} displayBorder={false} selected={tx.selected}>
                            <TableRowColumn style={{width:'13%'}}>{moment(new Date(tx.time * 1000)).format('YYYY-MM-DD - HH:mm:ss')}</TableRowColumn>
                            <TableRowColumn style={{width:'21%'}}>{tx.account}</TableRowColumn>
                            <TableRowColumn style={{width:'26%'}} className='font-mono'>{tx.address}</TableRowColumn>
                            <TableRowColumn style={{textAlign:'right', width:'16%'}}>{tx.category}</TableRowColumn>
                            <TableRowColumn style={{textAlign:'right', width:'12%'}}>{parseFloat(tx.amount).toFixed(6)}</TableRowColumn>
                            <TableRowColumn style={{textAlign:'right', width:'12%'}}>{parseFloat(tx.amountLocal).toFixed(2)} {this.rates.localCurrency}</TableRowColumn>
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
}

export default Transactions
