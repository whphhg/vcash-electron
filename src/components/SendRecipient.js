import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Input, Popconfirm, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'send') @observer

class SendRecipient extends React.Component {
  constructor (props) {
    super(props)
    this.data = props.data
    this.rates = props.rates
    this.send = props.send
    this.t = props.t
    this.removeRecipient = this.removeRecipient.bind(this)
    this.setRecipient = this.setRecipient.bind(this)
  }

  removeRecipient (uid) {
    this.send.removeRecipient(uid)
  }

  setRecipient (event) {
    this.send.setRecipient(event.target.id, event.target.name, event.target.value)
  }

  render () {
    const { uid, address, addressValid, amount } = this.data
    return (
      <div style={{margin: '0 0 5px 0'}}>
        <Row key={uid}>
          <Col span={13}>
            <div style={{margin: '0 5px 0 0'}}>
              <Input
                value={address}
                name='address'
                id={uid}
                placeholder={this.t('wallet:recipientsAddress')}
                onChange={this.setRecipient}
                className={'text-mono ' +
                  (addressValid !== null
                    ? addressValid === true
                        ? 'green'
                        : 'red'
                    : '')
                }
                addonBefore={
                  <Popconfirm
                    placement='bottomLeft'
                    title={this.t('wallet:recipientRemove')}
                    okText={this.t('wallet:yes')}
                    cancelText={this.t('wallet:no')}
                    onConfirm={() => this.removeRecipient(uid)}
                  >
                    <i className='material-icons md-16'>delete_forever</i>
                  </Popconfirm>
                }
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={{margin: '0 5px 0 0'}}>
              <Input
                value={amount}
                name='amount'
                id={uid}
                placeholder={this.t('wallet:amount')}
                addonAfter='XVC'
                onChange={this.setRecipient}
              />
            </div>
          </Col>
          <Col span={5}>
            <Input
              disabled
              value={(amount * this.rates.average * this.rates.local).toFixed(2)}
              addonAfter={this.rates.localCurrency}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

export default SendRecipient
