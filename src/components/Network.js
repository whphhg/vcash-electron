import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { Button, Col, Row } from 'antd'
import { v4 } from 'node-uuid'
import moment from 'moment'

/** Required components. */
import TableCell from './TableCell'
import NetworkGeoMap from './NetworkGeoMap'
import RewardCalculator from './RewardCalculator'

/** Make the component reactive and inject MobX stores. */
@observer(['network', 'wallet'])

class Network extends React.Component {
  constructor(props) {
    super(props)
    this.network = props.network
    this.wallet = props.wallet
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={8}>
            <div className='margin-10'>
              <i className='material-icons md-20' style={{float:'left'}}>computer</i>
              <p style={{float:'left', paddingLeft:'8px', margin:'0px'}}>
                <span className='font-weight-500'>{this.network.incentive.networkstatus === 'ok' ? 'Connectable' : 'Firewalled'}</span> node at {this.network.ip}:<span className='font-weight-500'>{this.network.port}</span>
              </p>
            </div>
            <div style={{clear:'both'}}></div>
          </Col>
          <Col span={6}>
            <div className='margin-10'>
              <i className='material-icons md-20' style={{float:'left'}}>settings_input_antenna</i>
              <p style={{float:'left', paddingLeft:'8px', margin:'0px'}}>
                <span className='font-weight-500'>{this.network.tcp} TCP</span> and <span className='font-weight-500'>{this.network.udp} UDP</span> connections
              </p>
            </div>
            <div style={{clear:'both'}}></div>
          </Col>
          <Col span={6}>
            <div className='margin-10'>
              <i className='material-icons md-20' style={{float:'left'}}>extension</i>
              <p style={{float:'left', paddingLeft:'8px', margin:'0px'}}>
                On block <span className='font-weight-500'>#{this.wallet.blocks}</span>
              </p>
            </div>
            <div style={{clear:'both'}}></div>
          </Col>
          <Col span={4}>
            <div className='margin-10' style={{textAlign:'right'}}>
              <RewardCalculator />
            </div>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div className='shadow-2'>
              <div id='network'>
                <Table rowsCount={this.network.connectedNodes.length} rowHeight={50} headerHeight={50} width={1130} height={263}>
                  <Column
                    header={<Cell>Connected peers</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='addr' />}
                    width={200}
                  />
                  <Column
                    header={<Cell>Country</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='country' />}
                    width={300}
                  />
                  <Column
                    header={<Cell>Version</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='subverClean' />}
                    width={110}
                  />
                  <Column
                    header={<Cell>OS</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='os' />}
                    width={110}
                  />
                  <Column
                    header={<Cell>Connected</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='conntime' />}
                    width={200}
                  />
                  <Column
                    header={<Cell>Starting height</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='startingheight' />}
                    width={130}
                  />
                  <Column
                    header={<Cell>Ban score</Cell>}
                    cell={<TableCell data={this.network.connectedNodes} column='banscore' />}
                    width={80}
                  />
                </Table>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <NetworkGeoMap />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Network
