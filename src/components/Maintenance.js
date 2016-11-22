import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Row } from 'antd'
import { Table, Column, Cell } from 'fixed-data-table'
import { tableHeight } from '../utilities/common'

/** Required components. */
import LocalCurrency from './LocalCurrency'
import RewardCalculator from './RewardCalculator'
import TableCell from './TableCell'
import WalletBackup from './WalletBackup'
import WalletDump from './WalletDump'
import WalletPassphraseChange from './WalletPassphraseChange'
import WalletSeedDump from './WalletSeedDump'

/** Make the component reactive and inject MobX stores. */
@inject('network') @observer

class Maintenance extends React.Component {
  constructor(props) {
    super(props)
    this.network = props.network
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <div className='left'>
                <RewardCalculator />
              </div>
              <div className='right'>
                <p>Set local currency</p>
                <LocalCurrency />
              </div>
            </div>
          </Col>
        </Row>
        <Row id='maintenance'>
          <Col span={12}>
            <div style={{margin: '0 10px 0 0'}}>
              <WalletBackup />
              <hr />
              <WalletDump />
              <hr />
              <WalletSeedDump />
            </div>
          </Col>
          <Col span={12}>
            <div style={{margin: '0 0 0 10px'}}>
              <WalletPassphraseChange />
              {/** TODO: Implement wallet check and repair. */}
            </div>
          </Col>
        </Row>
        <Row id='maintenance-tables'>
          <Col span={19}>
            <Table rowsCount={this.network.peers.length} rowHeight={25} headerHeight={25} width={892} height={tableHeight(this.network.peers.length, 227)}>
              <Column header={<Cell>Connected peers</Cell>} cell={<TableCell data={this.network.peers} column='addr' />} width={170} />
              <Column header={<Cell>Country</Cell>} cell={<TableCell data={this.network.peers} column='country' />} width={170} />
              <Column header={<Cell>Version</Cell>} cell={<TableCell data={this.network.peers} column='version' />} width={112} />
              <Column header={<Cell>OS</Cell>} cell={<TableCell data={this.network.peers} column='os' />} width={100} />
              <Column header={<Cell>Connected</Cell>} cell={<TableCell data={this.network.peers} column='conntime' />} width={150} />
              <Column header={<Cell>Starting height</Cell>} cell={<TableCell data={this.network.peers} column='startingheight' />} width={110} />
              <Column header={<Cell>Ban score</Cell>} cell={<TableCell data={this.network.peers} column='banscore' />} width={80} />
            </Table>
          </Col>
          <Col span={5}>
            <div style={{margin: '0 0 0 6px'}}>
              <Table rowsCount={this.network.byCountry.length} rowHeight={25} headerHeight={25} width={230} height={tableHeight(this.network.byCountry.length, 227)}>
                <Column header={<Cell>Known endpoints</Cell>} cell={<TableCell data={this.network.byCountry} column='country' />} width={170} />
                <Column header={<Cell>{this.network.knownEndpoints}</Cell>} cell={<TableCell data={this.network.byCountry} column='count' />} width={60} />
              </Table>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Maintenance
