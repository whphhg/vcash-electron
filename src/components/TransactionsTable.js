import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions') @observer

class TransactionsTable extends React.Component {
  constructor (props) {
    super(props)
    this.transactions = props.transactions
    this.rates = props.rates
    this.onRowDoubleClick = this.onRowDoubleClick.bind(this)
  }

  onRowDoubleClick (event, index) {
    this.transactions.setViewingTxid(this.transactions.filtered[index].txid)
  }

  render () {
    return (
      <Table
        rowsCount={this.transactions.filtered.length}
        rowHeight={25}
        headerHeight={25}
        width={1130}
        onRowDoubleClick={this.onRowDoubleClick}
        height={tableHeight(this.transactions.filtered.length, 417)}
      >
        <Column
          header={<Cell>Date</Cell>}
          cell={<TableCell data={this.transactions.filtered} column='time' />}
          width={145}
        />
        <Column
          header={<Cell>Status</Cell>}
          cell={<TableCell data={this.transactions.filtered} column='status' />}
          width={170}
        />
        <Column
          header={<Cell>Address</Cell>}
          cell={<TableCell data={this.transactions.filtered} column='address' />}
          width={285}
        />
        <Column
          header={<Cell>Account</Cell>}
          cell={<TableCell data={this.transactions.filtered} column='account' />}
          width={230}
        />
        <Column
          header={<Cell>Amount</Cell>}
          cell={<TableCell data={this.transactions.filtered} column='amount' />}
          width={150}
        />
        <Column
          header={<Cell>{this.rates.localCurrency}</Cell>}
          cell={
            <TableCell
              data={this.transactions.filtered}
              column='amountLocal'
              type='localAmount'
              extra={this.rates.localCurrency}
            />
          }
          width={150}
        />
      </Table>
    )
  }
}

export default TransactionsTable
