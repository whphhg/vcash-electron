import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@inject('network') @observer

class NetworkPeersTable extends React.Component {
  constructor (props) {
    super(props)
    this.network = props.network
  }

  render () {
    return (
      <Table
        rowsCount={this.network.peers.length}
        rowHeight={25}
        headerHeight={25}
        width={892}
        height={tableHeight(this.network.peers.length, 227)}
      >
        <Column
          header={<Cell>Connected peers</Cell>}
          cell={<TableCell data={this.network.peers} column='addr' />}
          width={170}
        />
        <Column
          header={<Cell>Country</Cell>}
          cell={<TableCell data={this.network.peers} column='country' />}
          width={170}
        />
        <Column
          header={<Cell>Version</Cell>}
          cell={<TableCell data={this.network.peers} column='version' />}
          width={112}
        />
        <Column
          header={<Cell>OS</Cell>}
          cell={<TableCell data={this.network.peers} column='os' />}
          width={100}
        />
        <Column
          header={<Cell>Connected</Cell>}
          cell={<TableCell data={this.network.peers} column='conntime' />}
          width={150}
        />
        <Column
          header={<Cell>Starting height</Cell>}
          cell={<TableCell data={this.network.peers} column='startingheight' />}
          width={110}
        />
        <Column
          header={<Cell>Ban score</Cell>}
          cell={<TableCell data={this.network.peers} column='banscore' />}
          width={80}
        />
      </Table>
    )
  }
}

export default NetworkPeersTable
