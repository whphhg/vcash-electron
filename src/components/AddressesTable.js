import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'rates') @observer

class AddressesTable extends React.Component {
  constructor (props) {
    super(props)
    this.addresses = props.addresses
    this.rates = props.rates
  }

  render () {
    return (
      <Table
        rowsCount={this.addresses.all.length}
        rowHeight={25}
        headerHeight={25}
        width={1130}
        height={tableHeight(this.addresses.all.length, 569)}
      >
        <Column
          header={<Cell>Addresses</Cell>}
          cell={<TableCell data={this.addresses.all} column='address' />}
          width={285}
        />
        <Column
          header={<Cell>Account</Cell>}
          cell={<TableCell data={this.addresses.all} column='account' />}
          width={445}
        />
        <Column
          header={<Cell>Received</Cell>}
          cell={<TableCell data={this.addresses.all} column='amount' />}
          width={200}
        />
        <Column
          header={<Cell>{this.rates.localCurrency}</Cell>}
          cell={
            <TableCell
              data={this.addresses.all}
              column='localAmount'
              type='localAmount'
              extra={this.rates.localCurrency}
            />}
          width={200}
        />
      </Table>
    )
  }
}

export default AddressesTable
