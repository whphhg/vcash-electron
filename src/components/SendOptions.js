import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Col, Input, Row, Select } from 'antd'

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

  /**
   * Set account.
   * @function setAccount
   * @param {string} account - Account name.
   */
  setAccount = (account) => {
    this.send.setAccount(account)
  }

  /**
   * Set minimum confirmations.
   * @function setMinConf
   * @param {object} e - Input element event.
   */
  setMinConf = (e) => {
    this.send.setMinConf(e.target.value)
  }

  /**
   * Set transaction comment.
   * @function setComment
   * @param {object} e - Input element event.
   */
  setComment = (e) => {
    this.send.setComment(e.target.value)
  }

  /**
   * Set recipient comment.
   * @function setCommentTo
   * @param {object} e - Input element event.
   */
  setCommentTo = (e) => {
    this.send.setCommentTo(e.target.value)
  }

  render () {
    const { fromAccount, recipients, comment, commentTo, minConf } = this.send
    const { Option } = Select

    return (
      <div>
        <Row>
          <Col span={6}>
            <p style={{margin: '1px 0 0 0'}}>
              {this.t('wallet:spendFrom')}
            </p>
          </Col>
          <Col span={10}>
            <Select
              size='small'
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
                this.wallet.accounts.map((account) => (
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
              size='small'
              disabled
              defaultValue={
                new Intl.NumberFormat(this.gui.language, {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6
                }).format(0)
              }
              addonBefore={this.t('wallet:balance')}
              addonAfter='XVC'
            />
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <p style={{margin: '6px 0 0 0'}}>
              {this.t('wallet:description')}
            </p>
          </Col>
          <Col span={18}>
            <Input
              size='small'
              placeholder={this.t('wallet:descriptionLong')}
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
                <p style={{margin: '6px 0 0 0'}}>
                  {this.t('wallet:recipient')}
                </p>
              </Col>
              <Col span={18}>
                <Input
                  size='small'
                  placeholder={this.t('wallet:recipientLong')}
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
                <p style={{margin: '6px 0 0 0'}}>
                  {this.t('wallet:minimumConfirmations')}
                </p>
              </Col>
              <Col span={3}>
                <Input
                  size='small'
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
