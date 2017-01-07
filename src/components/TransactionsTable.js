import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import TableCell from './TableCell'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions') @observer

class TransactionsTable extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.transactions = props.transactions
    this.rates = props.rates
    this.onRowDoubleClick = this.onRowDoubleClick.bind(this)
  }

  onRowDoubleClick (e, index) {
    this.transactions.setViewing(this.transactions.filtered[index].txid)
  }

  render () {
    /** Destructure properties. */
    const {
      filtered
    } = this.transactions

    return (
      <Table
        rowsCount={filtered.length}
        rowHeight={25}
        headerHeight={25}
        width={1130}
        onRowDoubleClick={this.onRowDoubleClick}
        height={tableHeight(filtered.length, 417)}
      >
        <Column
          header={<Cell>{this.t('wallet:date')}</Cell>}
          cell={<TableCell data={filtered} column='time' />}
          width={150}
        />
        <Column
          header={<Cell>{this.t('wallet:category')}</Cell>}
          cell={<TableCell data={filtered} column='category' />}
          width={130}
        />
        <Column
          header={<Cell>{this.t('wallet:address')}</Cell>}
          cell={<TableCell data={filtered} column='address' />}
          width={285}
        />
        <Column
          header={<Cell>{this.t('wallet:account')}</Cell>}
          cell={<TableCell data={filtered} column='account' />}
          width={270}
        />
        <Column
          header={<Cell>{this.t('wallet:amount')}</Cell>}
          cell={<TableCell data={filtered} column='amount' />}
          width={145}
        />
        <Column
          header={<Cell>{this.rates.localCurrency}</Cell>}
          cell={
            <TableCell
              data={filtered}
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
