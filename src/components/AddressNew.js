import React from 'react'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'addressNew') @observer

class AddressNew extends React.Component {
  constructor(props) {
    super(props)
    this.addresses = props.addresses
    this.addressNew = props.addressNew
    this.getnewaddress = this.getnewaddress.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  getnewaddress() {
    this.addressNew.getnewaddress()
  }

  setAccount(account, label) {
    this.addressNew.setAccount(account)
  }

  togglePopover() {
    this.addressNew.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24} style={{height: '28px'}}>
            <AutoComplete
              placeholder='Account name (optional)'
              style={{width: '100%'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.addressNew.account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
          </Col>
        </Row>
        <div>
          {
            this.addressNew.address !== '' && (
              <Input
                style={{margin: '5px 0 0 0'}}
                value={this.addressNew.address}
              />
            )
          }
        </div>
        <Row>
          <Col span={14}>
            {
              this.addressNew.errorStatus === 'invalidCharacters' && (
                <p className='text-error'>You can only enter alphanumerals, dash and space.</p>
              ) ||
              this.addressNew.errorStatus === 'keypoolRanOut' && (
                <p className='text-error'>Keypool ran out.</p>
              )
            }
          </Col>
          <Col span={10} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.getnewaddress}
              disabled={this.addressNew.errorStatus !== false}
            >
              Generate new address
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <Popover
        title='Generate a new receiving address'
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.addressNew.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button>Get new address</Button>
      </Popover>
    )
  }
}

export default AddressNew
