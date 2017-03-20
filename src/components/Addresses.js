import React from 'react'
import { translate } from 'react-i18next'
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
@inject('rates', 'send', 'ui', 'wallet') @observer

export default class Addresses extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.send = props.send
    this.ui = props.ui
    this.wallet = props.wallet
  }

  render () {
    const { total } = this.send
    const { local, localCurrency, average } = this.rates

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
                rowKey='address'
                columns={[
                  {
                    title: this.t('wallet:addresses'),
                    dataIndex: 'address',
                    width: 290,
                    render: address => <p className='text-mono'>{address}</p>,
                    filters: [
                      {
                        text: this.t('wallet:used'),
                        value: 'used'
                      },
                      {
                        text: this.t('wallet:unused'),
                        value: 'unused'
                      },
                      {
                        text: this.t('wallet:new'),
                        value: 'new'
                      }
                    ],
                    onFilter: (value, record) => {
                      switch (value) {
                        case 'used':
                          return record.received - record.spent === 0 &&
                            record.received > 0

                        case 'unused':
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
                          new Intl.NumberFormat(this.ui.language, {
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
                            new Intl.NumberFormat(this.ui.language, {
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
                            new Intl.NumberFormat(this.ui.language, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(total * local * average)
                          }
                          addonAfter={localCurrency}
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
