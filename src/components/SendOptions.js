import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Input, Row, Select } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'send') @observer

class SendOptions extends React.Component {
  constructor (props) {
    super(props)
    this.addresses = props.addresses
    this.send = props.send
    this.t = props.t
    this.setAccount = this.setAccount.bind(this)
    this.setMinConf = this.setMinConf.bind(this)
    this.setComment = this.setComment.bind(this)
    this.setCommentTo = this.setCommentTo.bind(this)
  }

  setAccount (account) {
    this.send.setAccount(account)
  }

  setMinConf (event) {
    this.send.setMinConf(event.target.value)
  }

  setComment (event) {
    this.send.setComment(event.target.value)
  }

  setCommentTo (event) {
    this.send.setCommentTo(event.target.value)
  }

  render () {
    return (
      <div>
        <Row>
          <Col span={6}>
            <p style={{margin: '4px 0 0 0'}}>{this.t('wallet:spendFrom')}</p>
          </Col>
          <Col span={10}>
            <Select
              style={{width: '247px'}}
              value={this.send.fromAccount}
              optionFilterProp='children'
              onChange={this.setAccount}
            >
              <Select.Option
                value={null}
                disabled={this.send.recipients.size > 1}
              >
                {this.t('wallet:any')}
              </Select.Option>
              <Select.Option
                value='*'
              >
                {this.t('wallet:default')}
              </Select.Option>
              {
                this.addresses.accounts.map((account) => (
                  <Select.Option
                    key={account}
                    value={account}
                  >
                    {account}
                  </Select.Option>
                ))
              }
            </Select>
          </Col>
          <Col span={8}>
            <Input
              disabled
              defaultValue={(0).toFixed(6)}
              addonBefore={this.t('wallet:balance')}
              addonAfter='XVC'
            />
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <p style={{margin: '9px 0 0 0'}}>{this.t('wallet:transactionComment')}</p>
          </Col>
          <Col span={18}>
            <Input
              placeholder={this.t('wallet:transactionCommentLong')}
              style={{margin: '5px 0 0 0'}}
              value={this.send.comment}
              onChange={this.setComment}
            />
          </Col>
        </Row>
        {
          this.send.recipients.size === 1 && (
            <Row>
              <Col span={6}>
                <p style={{margin: '9px 0 0 0'}}>{this.t('wallet:recipientComment')}</p>
              </Col>
              <Col span={18}>
                <Input
                  placeholder={this.t('wallet:recipientCommentLong')}
                  style={{margin: '5px 0 0 0'}}
                  value={this.send.commentTo}
                  onChange={this.setCommentTo}
                />
              </Col>
            </Row>
          )
        }
        {
          this.send.fromAccount !== null && (
            <Row>
              <Col span={6}>
                <p style={{margin: '9px 0 0 0'}}>{this.t('wallet:minimumConfirmations')}</p>
              </Col>
              <Col span={3}>
                <Input
                  style={{margin: '5px 0 0 0'}}
                  value={this.send.minConf}
                  onChange={this.setMinConf}
                />
              </Col>
            </Row>
          )
        }
      </div>
    )
  }
}

export default SendOptions
