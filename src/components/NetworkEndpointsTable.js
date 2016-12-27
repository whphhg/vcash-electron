import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@inject('network', 'wallet') @observer

class EndpointsTable extends React.Component {
  constructor (props) {
    super(props)
    this.network = props.network
  }

  render () {
    return (
      <Table
        rowsCount={this.network.byCountry.length}
        rowHeight={25}
        headerHeight={25}
        width={230}
        height={tableHeight(this.network.byCountry.length, 227)}
      >
        <Column
          header={<Cell>Known endpoints</Cell>}
          cell={<TableCell data={this.network.byCountry} column='country' />}
          width={170}
        />
        <Column
          header={<Cell>{this.network.knownEndpoints}</Cell>}
          cell={<TableCell data={this.network.byCountry} column='count' />}
          width={60}
        />
      </Table>
    )
  }
}

export default EndpointsTable
