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

  setMinConf (e) {
    this.send.setMinConf(e.target.value)
  }

  setComment (e) {
    this.send.setComment(e.target.value)
  }

  setCommentTo (e) {
    this.send.setCommentTo(e.target.value)
  }

  render () {
    /** Destructure properties. */
    const {
      fromAccount,
      recipients,
      comment,
      commentTo,
      minConf
    } = this.send

    const {
      Option
    } = Select

    return (
      <div>
        <Row>
          <Col span={6}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:spendFrom')}
            </p>
          </Col>
          <Col span={10}>
            <Select
              style={{width: '247px'}}
              value={fromAccount}
              optionFilterProp='children'
              onChange={this.setAccount}
            >
              <Option
                value={null}
                disabled={recipients.size > 1}
              >
                {this.t('wallet:any')}
              </Option>
              <Option value='*'>
                {this.t('wallet:default')}
              </Option>
              {
                this.addresses.accounts.map((account) => (
                  <Option
                    key={account}
                    value={account}
                  >
                    {account}
                  </Option>
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
            <p style={{margin: '9px 0 0 0'}}>
              {this.t('wallet:transactionComment')}
            </p>
          </Col>
          <Col span={18}>
            <Input
              placeholder={this.t('wallet:transactionCommentLong')}
              style={{margin: '5px 0 0 0'}}
              value={comment}
              onChange={this.setComment}
            />
          </Col>
        </Row>
        {
          recipients.size === 1 && (
            <Row>
              <Col span={6}>
                <p style={{margin: '9px 0 0 0'}}>
                  {this.t('wallet:recipientComment')}
                </p>
              </Col>
              <Col span={18}>
                <Input
                  placeholder={this.t('wallet:recipientCommentLong')}
                  style={{margin: '5px 0 0 0'}}
                  value={commentTo}
                  onChange={this.setCommentTo}
                />
              </Col>
            </Row>
          )
        }
        {
          fromAccount !== null && (
            <Row>
              <Col span={6}>
                <p style={{margin: '9px 0 0 0'}}>
                  {this.t('wallet:minimumConfirmations')}
                </p>
              </Col>
              <Col span={3}>
                <Input
                  style={{margin: '5px 0 0 0'}}
                  value={minConf}
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
