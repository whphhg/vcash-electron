import React from 'react'
import { translate } from 'react-i18next'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Col, Input, Row, Table } from 'antd'

/** Required components. */
import Address from './Address'
import AddressNew from './AddressNew'
import CurrencyConverter from './CurrencyConverter'
import KeyDump from './KeyDump'
import KeyImport from './KeyImport'
import SendControls from './SendControls'
import SendOptions from './SendOptions'
import SendRecipient from './SendRecipient'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'rates', 'send', 'wallet') @observer

export default class Addresses extends React.Component {
  @observable filters = {
    address: ['spendable', 'new']
  }

  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
    this.wallet = props.wallet
  }

  /**
   * Handle table change.
   * @function tableChange
   */
  @action tableChange = (pagination, filters, sorter) => {
    this.filters = filters
  }

  render () {
    const { total } = this.send
    const { local, average } = this.rates

    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <div className='toolbar'>
              <Col span={11}>
                <AddressNew />
                <KeyImport />
                <KeyDump />
              </Col>
              <Col span={13}>
                <div style={{margin: '0 0 0 9px'}}>
                  <SendControls />
                </div>
              </Col>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <div style={{margin: '10px'}}>
              <Table
                bordered
                size='small'
                scroll={{y: 527}}
                pagination={false}
                expandedRowRender={data => (
                  <Address data={data} />
                )}
                locale={{
                  filterConfirm: this.t('wallet:ok'),
                  filterReset: this.t('wallet:reset'),
                  emptyText: this.t('wallet:notFound')
                }}
                dataSource={this.wallet.addressData}
                onChange={this.tableChange}
                rowKey='address'
                columns={[
                  {
                    title: this.t('wallet:addresses'),
                    dataIndex: 'address',
                    width: 290,
                    render: address => <p className='text-mono'>{address}</p>,
                    filteredValue: this.filters.address.slice() || null,
                    filters: [
                      {
                        text: this.t('wallet:spent'),
                        value: 'spent'
                      },
                      {
                        text: this.t('wallet:spendable'),
                        value: 'spendable'
                      },
                      {
                        text: this.t('wallet:new'),
                        value: 'new'
                      }
                    ],
                    onFilter: (value, record) => {
                      switch (value) {
                        case 'spent':
                          return record.received - record.spent === 0 &&
                            record.received > 0

                        case 'spendable':
                          return record.received - record.spent !== 0

                        case 'new':
                          return record.received === 0
                      }
                    }
                  },
                  {
                    title: this.t('wallet:balance'),
                    dataIndex: 'balance',
                    sorter: (a, b) => a.balance - b.balance,
                    render: balance => (
                      <p style={{textAlign: 'right'}}>
                        {
                          new Intl.NumberFormat(this.gui.language, {
                            minimumFractionDigits: 6,
                            maximumFractionDigits: 6
                          }).format(balance)
                        } XVC
                      </p>
                    )
                  }
                ]}
              />
            </div>
          </Col>
          <Col span={13}>
            <div style={{margin: '10px'}}>
              <div id='sendRecipients'>
                {
                  this.send.recipients.entries().map((recipient) => (
                    <SendRecipient
                      data={recipient[1]}
                      key={recipient[1].uid}
                    />
                  ))
                }
              </div>
              {
                this.send.recipients.size > 1 && (
                  <Row>
                    <Col span={6} offset={13}>
                      <div style={{margin: '0 5px 5px 0'}}>
                        <Input
                          disabled
                          value={
                            new Intl.NumberFormat(this.gui.language, {
                              minimumFractionDigits: 6,
                              maximumFractionDigits: 6
                            }).format(total)
                          }
                          addonAfter='XVC'
                        />
                      </div>
                    </Col>
                    <Col span={5}>
                      <div style={{margin: '0 0 5px 0'}}>
                        <Input
                          disabled
                          value={
                            new Intl.NumberFormat(this.gui.language, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(total * local * average)
                          }
                          addonAfter={this.gui.localCurrency}
                        />
                      </div>
                    </Col>
                  </Row>
                )
              }
              <hr style={{margin: '5px 0 9px 0'}} />
              <SendOptions />
              <hr style={{margin: '10px 0 9px 0'}} />
              <CurrencyConverter />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
