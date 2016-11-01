import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Row, Popconfirm } from 'antd'
import { Table, Column, Cell } from 'fixed-data-table'

/** Required components. */
import AddressNew from './AddressNew'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'
import WalletDump from './WalletDump'
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@observer(['addresses', 'rates', 'wallet'])

class Addresses extends React.Component {
  constructor(props) {
    super(props)
    this.addresses = props.addresses
    this.rates = props.rates
    this.wallet = props.wallet
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={15}>
            <div className='margin-10'>
              <div style={{float:'left'}}><AddressNew /></div>
              <div style={{float:'left', marginLeft:'10px'}}><KeyImport /></div>
              <div style={{float:'left', marginLeft:'10px'}}><KeyDump /></div>
              <div style={{float:'left', marginLeft:'10px'}}><WalletDump /></div>
              <div style={{clear:'both'}}></div>
            </div>
          </Col>
          <Col span={9}>
            <div style={{float:'right'}}>
              <div className='margin-10'>
                <div className='toolbar-text'>
                  <i className='material-icons md-20' style={{float:'left'}}>library_books</i>
                  <p style={{float:'left', marginLeft:'8px', marginRight:'3px'}}>
                    Default wallet address <span className='font-weight-500'>{this.wallet.incentive.walletaddress === '' ? 'will be revealed after first unlocking' : this.wallet.incentive.walletaddress}</span>
                  </p>
                </div>
              </div>
            </div>
            <div style={{clear:'both'}}></div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div style={{marginLeft:'10px'}}>
              <Table rowsCount={this.addresses.all.length} rowHeight={25} headerHeight={25} width={1130} height={580}>
                <Column header={<Cell>Addresses</Cell>} cell={<TableCell data={this.addresses.all} column='address' />} width={285} />
                <Column header={<Cell>Account</Cell>} cell={<TableCell data={this.addresses.all} column='account' />} width={445} />
                <Column header={<Cell>Received</Cell>} cell={<TableCell data={this.addresses.all} column='amount' />} width={200} />
                <Column header={<Cell>{this.rates.localCurrency}</Cell>} cell={<TableCell data={this.addresses.all} column='localAmount' type='localAmount' extra={this.rates.localCurrency} />} width={200} />
              </Table>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Addresses
