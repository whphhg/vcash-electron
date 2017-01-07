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
@inject('addresses', 'rates') @observer

class AddressesTable extends React.Component {
  constructor (props) {
    super(props)
    this.addresses = props.addresses
    this.rates = props.rates
    this.t = props.t
  }

  render () {
    /** Destructure properties. */
    const {
      all
    } = this.addresses

    return (
      <Table
        rowsCount={all.length}
        rowHeight={25}
        headerHeight={25}
        width={509}
        height={tableHeight(all.length, 545)}
      >
        <Column
          header={<Cell>{this.t('wallet:addresses')}</Cell>}
          cell={<TableCell data={all} column='address' />}
          width={285}
        />
        <Column
          header={<Cell>{this.t('wallet:received')}</Cell>}
          cell={<TableCell data={all} column='amount' />}
          width={115}
        />
        <Column
          header={<Cell>{this.rates.localCurrency}</Cell>}
          cell={
            <TableCell
              data={all}
              column='localAmount'
              type='localAmount'
              extra={this.rates.localCurrency}
            />}
          width={109}
        />
      </Table>
    )
  }
}

export default AddressesTable
