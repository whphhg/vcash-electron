import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popconfirm, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'send', 'wallet') @observer

class Send extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.send = props.send
    this.wallet = props.wallet
    this.confirm = this.confirm.bind(this)
    this.addRecipient = this.addRecipient.bind(this)
    this.clear = this.clear.bind(this)
  }

  confirm () {
    this.send.confirm()
  }

  addRecipient () {
    this.send.addRecipient()
  }

  clear () {
    this.send.clear()
  }

  render () {
    const { local, localCurrency, average } = this.rates
    const { errorStatus, fromAccount, total } = this.send

    return (
      <Row>
        <Col span={11}>
          <Popconfirm
            placement='bottomLeft'
            title={this.t('wallet:sendConfirm')}
            okText={this.t('wallet:yes')}
            cancelText={this.t('wallet:no')}
            onConfirm={this.confirm}
          >
            <Button
              disabled={
                this.wallet.isLocked === true ||
                this.wallet.balance < 0.0005 ||
                errorStatus !== false
              }
            >
              {this.t('wallet:send')}
            </Button>
          </Popconfirm>
          <Button
            onClick={this.addRecipient}
            disabled={fromAccount === null}
          >
            <i className='material-icons md-16'>person_add</i>
          </Button>
          <Popconfirm
            placement='bottom'
            title={this.t('wallet:sendReset')}
            okText={this.t('wallet:yes')}
            cancelText={this.t('wallet:no')}
            onConfirm={this.clear}
          >
            <Button>{this.t('wallet:reset')}</Button>
          </Popconfirm>
        </Col>
        <Col span={8}>
          <div style={{margin: '0 5px 0 0'}}>
            <Input
              disabled
              value={(total).toFixed(6)}
              addonBefore={this.t('wallet:total')}
              addonAfter='XVC'
            />
          </div>
        </Col>
        <Col span={5}>
          <Input
            disabled
            value={(total * local * average).toFixed(2)}
            addonAfter={localCurrency}
          />
        </Col>
      </Row>
    )
  }
}

export default Send
