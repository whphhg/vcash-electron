import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input, Popconfirm } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'rates', 'send') @observer

export default class SendRecipient extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.rates = props.rates
    this.send = props.send
  }

  /**
   * Remove recipient.
   * @function removeRecipient
   * @param {string} uid - Uid.
   */
  removeRecipient = (uid) => {
    this.send.removeRecipient(uid)
  }

  /**
   * Set recipient.
   * @function setRecipient
   * @param {object} e - Input element event.
   */
  setRecipient = (e) => {
    this.send.setRecipient(e.target.id, e.target.name, e.target.value)
  }

  render () {
    const { local, average } = this.rates

    return (
      <div>
        <div id='sendRecipients'>
          {
            this.send.recipients.values().map((recipient) => (
              <div
                className='flex-sb'
                key={recipient.uid}
                style={{margin: '0 0 5px 0'}}
              >
                <div style={{width: '55%'}}>
                  <Input
                    className={'text-mono ' + (
                      recipient.addressValid !== null
                        ? recipient.addressValid === true ? 'green' : 'red'
                        : ''
                      )
                    }
                    id={recipient.uid}
                    name='address'
                    onChange={this.setRecipient}
                    placeholder={this.t('wallet:address')}
                    prefix={
                      <Popconfirm
                        cancelText={this.t('wallet:no')}
                        okText={this.t('wallet:yes')}
                        onConfirm={() => this.removeRecipient(recipient.uid)}
                        placement='bottomLeft'
                        title={this.t('wallet:recipientRemove')}
                      >
                        <div style={{cursor: 'pointer'}}>
                          <i className='material-icons md-14'>delete_forever</i>
                        </div>
                      </Popconfirm>
                    }
                    size='small'
                    value={recipient.address}
                  />
                </div>
                <div style={{flex: 1, margin: '0 10px 0 10px'}}>
                  <Input
                    addonAfter='XVC'
                    id={recipient.uid}
                    name='amount'
                    onChange={this.setRecipient}
                    placeholder={this.t('wallet:amount')}
                    size='small'
                    value={recipient.amount}
                  />
                </div>
                <div style={{flex: 1}}>
                  <Input
                    addonAfter={this.gui.localCurrency}
                    disabled
                    size='small'
                    value={
                      new Intl.NumberFormat(this.gui.language, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(recipient.amount * average * local)
                    }
                  />
                </div>
              </div>
            ))
          }
        </div>
        {
          this.send.recipients.size > 1 && (
            <div className='flex-sb' style={{margin: '5px 0 0 0'}}>
              <div style={{width: '55%'}} />
              <div style={{flex: 1, margin: '0 10px 0 10px'}}>
                <Input
                  addonAfter='XVC'
                  disabled
                  size='small'
                  value={
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(this.send.total)
                  }
                />
              </div>
              <div style={{flex: 1}}>
                <Input
                  addonAfter={this.gui.localCurrency}
                  disabled
                  size='small'
                  value={
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 2
                    }).format(this.send.total * local * average)
                  }
                />
              </div>
            </div>
          )
        }
      </div>
    )
  }
}
