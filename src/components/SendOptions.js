import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Input from 'antd/lib/input'

@translate(['wallet'], { wait: true })
@inject('gui', 'send', 'wallet')
@observer
class SendOptions extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.gui = props.gui
    this.send = props.send
    this.wallet = props.wallet
  }

  render() {
    return (
      <div>
        <div className="flex-sb">
          <div style={{ lineHeight: '22px', margin: '0 36px 0 0' }}>
            {this.send.recipients.size === 1 && (
              <div className="flex" style={{ margin: '5px 0 0 0' }}>
                <i className="material-icons md-16">perm_identity</i>
                <p>{this.t('wallet:recipient')}</p>
              </div>
            )}
            <div className="flex" style={{ margin: '5px 0 0 0' }}>
              <i className="material-icons md-16">create</i>
              <p>{this.t('wallet:description')}</p>
            </div>
            {this.wallet.spendFrom !== '#' && (
              <div className="flex" style={{ margin: '5px 0 0 0' }}>
                <i className="material-icons md-16">done_all</i>
                <p>{this.t('wallet:minimumConfirmations')}</p>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {this.send.recipients.size === 1 && (
              <div style={{ flex: 1, margin: '5px 0 0 0' }}>
                <Input
                  onChange={e => this.send.setCommentTo(e.target.value)}
                  placeholder={this.t('wallet:recipientLong')}
                  size="small"
                  value={this.send.commentTo}
                />
              </div>
            )}
            <div style={{ flex: 1, margin: '5px 0 0 0' }}>
              <Input
                onChange={e => this.send.setComment(e.target.value)}
                placeholder={this.t('wallet:descriptionLong')}
                size="small"
                value={this.send.comment}
              />
            </div>
            {this.wallet.spendFrom !== '#' && (
              <div style={{ width: '60px', margin: '5px 0 0 0' }}>
                <Input
                  onChange={e => this.send.setMinConf(e.target.value)}
                  size="small"
                  value={this.send.minConf}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default SendOptions
