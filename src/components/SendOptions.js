import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input, Select } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('gui', 'send', 'wallet') @observer

export default class SendOptions extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.send = props.send
    this.wallet = props.wallet
  }

  render () {
    const { fromAccount, recipients, comment, commentTo, minConf } = this.send

    return (
      <div>
        <div className='flex-sb'>
          <div style={{lineHeight: '22px', margin: '0 36px 0 0'}}>
            <div className='flex'>
              <i className='material-icons md-16'>account_balance</i>
              <p>{this.t('wallet:spendFrom')}</p>
            </div>
            {
              recipients.size === 1 && (
                <div className='flex' style={{margin: '5px 0 0 0'}}>
                  <i className='material-icons md-16'>perm_identity</i>
                  <p>{this.t('wallet:recipient')}</p>
                </div>
              )
            }
            <div className='flex' style={{margin: '5px 0 0 0'}}>
              <i className='material-icons md-16'>create</i>
              <p>{this.t('wallet:description')}</p>
            </div>
            {
              fromAccount !== null && (
                <div className='flex' style={{margin: '5px 0 0 0'}}>
                  <i className='material-icons md-16'>done_all</i>
                  <p>{this.t('wallet:minimumConfirmations')}</p>
                </div>
              )
            }
          </div>
          <div style={{flex: 1}}>
            <div className='flex'>
              <Select
                onChange={(account) => this.send.setAccount(account)}
                optionFilterProp='children'
                size='small'
                style={{flex: 1, margin: '0 10px 0 0'}}
                value={fromAccount}
              >
                <Select.Option disabled={recipients.size > 1} value={null}>
                  {this.t('wallet:any')}
                </Select.Option>
                <Select.Option value='*'>
                  {this.t('wallet:default')}
                </Select.Option>
                {
                  this.wallet.accounts.map((account) => (
                    <Select.Option key={account} value={account}>
                      {account}
                    </Select.Option>
                  ))
                }
              </Select>
              <div style={{width: '200px'}}>
                <Input
                  addonAfter='XVC'
                  addonBefore={this.t('wallet:balance')}
                  defaultValue={
                    new Intl.NumberFormat(this.gui.language, {
                      maximumFractionDigits: 6
                    }).format(0)
                  }
                  disabled
                  size='small'
                />
              </div>
            </div>
            {
              recipients.size === 1 && (
                <div style={{flex: 1, margin: '5px 0 0 0'}}>
                  <Input
                    onChange={(e) => this.send.setCommentTo(e.target.value)}
                    placeholder={this.t('wallet:recipientLong')}
                    size='small'
                    value={commentTo}
                  />
                </div>
              )
            }
            <div style={{flex: 1, margin: '5px 0 0 0'}}>
              <Input
                onChange={(e) => this.send.setComment(e.target.value)}
                placeholder={this.t('wallet:descriptionLong')}
                size='small'
                value={comment}
              />
            </div>
            {
              fromAccount !== null && (
                <div style={{width: '60px', margin: '5px 0 0 0'}}>
                  <Input
                    onChange={(e) => this.send.setMinConf(e.target.value)}
                    size='small'
                    value={minConf}
                  />
                </div>
              )
            }
          </div>
        </div>
      </div>
    )
  }
}
