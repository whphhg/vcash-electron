import React from 'react'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'keyImport', 'wallet') @observer

class KeyImport extends React.Component {
  constructor(props) {
    super(props)
    this.addresses = props.addresses
    this.keyImport = props.keyImport
    this.wallet = props.wallet
    this.importprivkey = this.importprivkey.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setPrivateKey = this.setPrivateKey.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  importprivkey() {
    this.keyImport.importprivkey()
  }

  setAccount(account) {
    this.keyImport.setAccount(account)
  }

  setPrivateKey(event) {
    this.keyImport.setPrivateKey(event.target.value)
  }

  togglePopover() {
    this.keyImport.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24}>
            <Input
              style={{margin: '0 0 5px 0'}}
              placeholder='Private key'
              value={this.keyImport.privateKey}
              onChange={this.setPrivateKey}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{height: '28px'}}>
            <AutoComplete
              placeholder='Account name (optional)'
              style={{width: '100%'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.keyImport.account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            {
              this.keyImport.errorStatus === 'invalidCharacters' && (
                <p className='text-error'>You can enter only alphanumerals, dash and space.</p>
              ) ||
              this.keyImport.errorStatus === 'invalidKey' && (
                <p className='text-error'>The private key is invalid.</p>
              ) ||
              this.keyImport.errorStatus === 'isMine' && (
                <p className='text-error'>The private key belongs to your wallet.</p>
              )
            }
          </Col>
          <Col span={8} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.importprivkey}
              disabled={this.keyImport.errorStatus !== false}
              loading={this.keyImport.loading === true}
            >
              Import the key
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title='Enter the private key you would like to import'
        visible={this.keyImport.popover === true}
        onVisibleChange={this.togglePopover}
        content={this.popoverContent()}
      >
        <Button
          disabled={this.wallet.isLocked === true}
        >
          Import the key
        </Button>
      </Popover>
    )
  }
}

export default KeyImport
