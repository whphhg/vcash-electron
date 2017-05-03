import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Input } from 'antd'

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
