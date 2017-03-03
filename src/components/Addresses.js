import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Row, Table } from 'antd'

/** Required components. */
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
@inject('addresses', 'rates', 'send', 'wallet') @observer

export default class Addresses extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.addresses = props.addresses
    this.rates = props.rates
    this.send = props.send
    this.wallet = props.wallet
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={24} className='shadow'>
            <Row>
              <Col span={11}>
                <div className='toolbar'>
                  <AddressNew />
                  <KeyImport />
                  <KeyDump />
                </div>
              </Col>
              <Col span={13}>
                <div className='toolbar'>
                  <SendControls />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <div style={{margin: '10px'}}>
              <Table
                bordered
                size='small'
                scroll={
                  this.addresses.all.length > 15
                    ? {y: 503}
                    : {}
                }
                pagination={false}
                dataSource={this.addresses.all}
                columns={[
                  {
                    title: this.t('wallet:addresses'),
                    dataIndex: 'address',
                    width: 290,
                    render: text => <p className='text-mono'>{text}</p>
                  },
                  {
                    title: this.t('wallet:balance'),
                    dataIndex: 'amount',
                    render: text => (
                      <p className='text-right'>{text} XVC</p>
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
              <hr id='send' />
              <SendOptions />
              <hr id='send' />
              <CurrencyConverter />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
