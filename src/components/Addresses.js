import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table'
import { Col, Row } from 'antd'
import { tableHeight } from '../utilities/common'

/** Required components. */
import AddressNew from './AddressNew'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'
import TableCell from './TableCell'

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'rates', 'wallet') @observer

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
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <div className='left'>
                <AddressNew />
                <KeyImport />
                <KeyDump />
              </div>
              <div className='right'>
                <i className='material-icons md-20'>library_books</i>
                <p>Default wallet address <span className='text-dotted'>
                  {
                    this.wallet.incentive.walletaddress === ''
                      ? 'will be revealed after first unlocking'
                      : this.wallet.incentive.walletaddress
                  }
                  </span>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <div id='addresses'>
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
              cell={<TableCell
                      data={this.addresses.all}
                      column='localAmount'
                      type='localAmount'
                      extra={this.rates.localCurrency}
                    />}
              width={200}
            />
          </Table>
        </div>
      </div>
    )
  }
}

export default Addresses
