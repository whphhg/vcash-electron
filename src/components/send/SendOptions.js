import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Input from 'antd/lib/input'

@translate(['common'])
@inject('send')
@observer
class SendOptions extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.send = props.send
  }

  render() {
    /** Do not render if spending outputs directly. */
    if (this.send.spend.utxo.length > 0) return null
    return (
      <div>
        <div className="flex-sb" style={{ lineHeight: '22px' }}>
          <div style={{ margin: '0 36px 0 0' }}>
            <div className="flex" style={{ margin: '5px 0 0 0' }}>
              <i className="material-icons md-16">label</i>
              <p>{this.t('spendFrom')}</p>
            </div>
            {this.send.recipients.size === 1 && (
              <div className="flex" style={{ margin: '5px 0 0 0' }}>
                <i className="material-icons md-16">perm_identity</i>
                <p>{this.t('recipient')}</p>
              </div>
            )}
            <div className="flex" style={{ margin: '5px 0 0 0' }}>
              <i className="material-icons md-16">create</i>
              <p>{this.t('description')}</p>
            </div>
            {this.send.spend.fromAccount !== '*ANY*' && (
              <div className="flex" style={{ margin: '5px 0 0 0' }}>
                <i className="material-icons md-16">done_all</i>
                <p>{this.t('minConf')}</p>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '5px 0 0 0' }}>
              {(this.send.spend.fromAccount === '*ANY*' && this.t('any')) ||
                (this.send.spend.fromAccount === '*DEFAULT*' &&
                  this.t('default')) ||
                this.send.spend.fromAccount}
            </p>
            {this.send.recipients.size === 1 && (
              <div style={{ flex: 1, margin: '5px 0 0 0' }}>
                <Input
                  onChange={e => this.send.setCommentTo(e.target.value)}
                  placeholder={this.t('recipientDesc')}
                  size="small"
                  value={this.send.commentTo}
                />
              </div>
            )}
            <div style={{ flex: 1, margin: '5px 0 0 0' }}>
              <Input
                onChange={e => this.send.setComment(e.target.value)}
                placeholder={this.t('descriptionLong')}
                size="small"
                value={this.send.comment}
              />
            </div>
            {this.send.spend.fromAccount !== '*ANY*' && (
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
