import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input, Popconfirm } from 'antd'

/** Sending recipients component. */
@translate(['wallet'], { wait: true })
@inject('gui', 'rates', 'send')
@observer
class SendRecipient extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
  }

  /**
   * Set recipient.
   * @function setRecipient
   * @param {object} e - Input element event.
   */
  setRecipient = e => {
    this.send.setRecipient(e.target.id, e.target.name, e.target.value)
  }

  render () {
    const { average, local } = this.rates

    return (
      <div>
        <div id='sendRecipients'>
          {this.send.recipients.values().map(rcpt =>
            <div
              className='flex-sb'
              key={rcpt.uid}
              style={{ margin: '0 0 5px 0' }}
            >
              <div style={{ width: '55%' }}>
                <Input
                  className={
                    'text-mono ' +
                    (rcpt.addressValid !== null
                      ? rcpt.addressValid === true ? 'green' : 'red'
                      : '')
                  }
                  id={rcpt.uid}
                  name='address'
                  onChange={this.setRecipient}
                  placeholder={this.t('wallet:address')}
                  prefix={
                    <Popconfirm
                      cancelText={this.t('wallet:no')}
                      okText={this.t('wallet:yes')}
                      onConfirm={() => this.send.removeRecipient(rcpt.uid)}
                      placement='bottomLeft'
                      title={this.t('wallet:recipientRemove')}
                    >
                      <div style={{ cursor: 'pointer' }}>
                        <i className='material-icons md-14'>delete_forever</i>
                      </div>
                    </Popconfirm>
                  }
                  size='small'
                  value={rcpt.address}
                />
              </div>
              <div style={{ flex: 1, margin: '0 10px 0 10px' }}>
                <Input
                  id={rcpt.uid}
                  name='amount'
                  onChange={this.setRecipient}
                  placeholder={this.t('wallet:amount')}
                  size='small'
                  suffix='XVC'
                  value={rcpt.amount}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  disabled
                  size='small'
                  suffix={this.gui.localCurrency}
                  value={new Intl.NumberFormat(this.gui.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(rcpt.amount * average * local)}
                />
              </div>
            </div>
          )}
        </div>
        {this.send.recipients.size > 1 &&
          <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
            <div style={{ width: '55%' }} />
            <div style={{ flex: 1, margin: '0 10px 0 10px' }}>
              <Input
                disabled
                size='small'
                suffix='XVC'
                value={new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 6
                }).format(this.send.total)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                disabled
                size='small'
                suffix={this.gui.localCurrency}
                value={new Intl.NumberFormat(this.gui.language, {
                  maximumFractionDigits: 2
                }).format(this.send.total * local * average)}
              />
            </div>
          </div>}
      </div>
    )
  }
}

export default SendRecipient
