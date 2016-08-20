import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
import moment from 'moment'
import { Table, Column, Cell } from 'fixed-data-table'

import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'

import TransactionsChart from './TransactionsChart'

const CreateCell = ({ rowIndex, data, column, localCurrency, ...props }) => {
  switch (column) {
    case 'amount':
      return (
        <Cell {...props}>
          {parseFloat(data[rowIndex][column]).toFixed(6)}
        </Cell>
      )

    case 'amountLocal':
      return (
        <Cell {...props}>
          {parseFloat(data[rowIndex][column]).toFixed(2)} {localCurrency}
        </Cell>
      )

    case 'time':
      return (
        <Cell {...props}>
          {moment(new Date(data[rowIndex][column] * 1000)).format('YYYY-MM-DD - HH:mm:ss')}
        </Cell>
      )

    default:
      return (
        <Cell {...props}>
          {data[rowIndex][column]}
        </Cell>
      )
  }
}

/**
 * TODO: Colorize amounts according to category.
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

    this.setFilters = this.setFilters.bind(this)
    this.setShowCategory = this.setShowCategory.bind(this)
    this.toggleTransaction = this.toggleTransaction.bind(this)
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

  toggleTransaction(rowNumber, columndId) {
    const txid = this.transactions.filtered[rowNumber].txid
    this.transaction.setTxid(txid)
    this.transaction.toggleDialog()
  }

  render() {
    // buttons instead of dropdown, ToggleButton, textfield that reveals for filtering
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


                  <Table
                    rowHeight={50}
                    headerHeight={50}
                    rowsCount={this.transactions.filtered.length}
                    width={1140}
                    height={100}
                  >
                    <Column
                      header={<Cell>Date</Cell>}
                      cell={<CreateCell data={this.transactions.filtered} column='time' />}
                      width={200}
                    />
                    <Column
                      header={<Cell>Account</Cell>}
                      cell={<CreateCell data={this.transactions.filtered} column='account' />}
                      width={200}
                    />
                    <Column
                      header={<Cell>Address</Cell>}
                      cell={<CreateCell data={this.transactions.filtered} column='address' />}
                      width={340}
                    />
                    <Column
                      header={<Cell>Category</Cell>}
                      cell={<CreateCell data={this.transactions.filtered} column='category' />}
                      width={100}
                    />
                    <Column
                      header={<Cell>Amount</Cell>}
                      cell={<CreateCell data={this.transactions.filtered} column='amount' />}
                      width={150}
                    />
                    <Column
                      header={<Cell>{this.rates.localCurrency}</Cell>}
                      cell={<CreateCell data={this.transactions.filtered} column='amountLocal' localCurrency={this.rates.localCurrency} />}
                      width={150}
                    />
                  </Table>


                </div>
              </div>
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

export default Transactions
