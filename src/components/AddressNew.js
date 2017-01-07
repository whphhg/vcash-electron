import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'addressNew') @observer

class AddressNew extends React.Component {
  constructor (props) {
    super(props)
    this.addresses = props.addresses
    this.addressNew = props.addressNew
    this.t = props.t
    this.getnewaddress = this.getnewaddress.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  getnewaddress () {
    this.addressNew.getnewaddress()
  }

  setAccount (account, label) {
    this.addressNew.setAccount(account)
  }

  togglePopover () {
    this.addressNew.togglePopover()
  }

  popoverContent () {
    /** Destructure properties. */
    const {
      account,
      address,
      errorStatus
    } = this.addressNew

    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24} style={{height: '28px'}}>
            <AutoComplete
              placeholder={this.t('wallet:accountName')}
              style={{width: '100%'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
          </Col>
        </Row>
        <div>
          {
            address !== '' && (
              <Input
                style={{margin: '5px 0 0 0'}}
                value={address}
                readOnly
              />
            )
          }
        </div>
        <Row>
          <Col span={14}>
            <p className='text-error'>
              {
                errorStatus === 'invalidCharacters' &&
                this.t('wallet:accountInvalidCharacters') ||

                errorStatus === 'keypoolRanOut' &&
                this.t('wallet:keypoolRanOut')
              }
            </p>
          </Col>
          <Col span={10} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.getnewaddress}
              disabled={errorStatus !== false}
            >
              {this.t('wallet:addressGenerate')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  render () {
    return (
      <Popover
        title={this.t('wallet:addressGenerateLong')}
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.addressNew.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button>{this.t('wallet:addressGenerate')}</Button>
      </Popover>
    )
  }
}

export default AddressNew
