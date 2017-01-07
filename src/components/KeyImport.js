import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'keyImport', 'wallet') @observer

class KeyImport extends React.Component {
  constructor (props) {
    super(props)
    this.addresses = props.addresses
    this.keyImport = props.keyImport
    this.t = props.t
    this.wallet = props.wallet
    this.importprivkey = this.importprivkey.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setPrivateKey = this.setPrivateKey.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  importprivkey () {
    this.keyImport.importprivkey()
  }

  setAccount (account) {
    this.keyImport.setAccount(account)
  }

  setPrivateKey (e) {
    this.keyImport.setPrivateKey(e.target.value)
  }

  togglePopover () {
    this.keyImport.togglePopover()
  }

  popoverContent () {
    /** Destructure properties. */
    const {
      account,
      errorStatus,
      loading,
      privateKey
    } = this.keyImport

    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24}>
            <Input
              style={{margin: '0 0 5px 0'}}
              placeholder={this.t('wallet:privateKey')}
              value={privateKey}
              onChange={this.setPrivateKey}
            />
          </Col>
        </Row>
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
        <Row>
          <Col span={16}>
            <p className='text-error'>
              {
                errorStatus === 'invalidCharacters' &&
                this.t('wallet:accountInvalidCharacters') ||

                errorStatus === 'invalidKey' &&
                this.t('wallet:privateKeyInvalid') ||

                errorStatus === 'isMine' &&
                this.t('wallet:privateKeyIsMine')
              }
            </p>
          </Col>
          <Col span={8} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.importprivkey}
              disabled={errorStatus !== false}
              loading={loading === true}
            >
              {this.t('wallet:privateKeyImport')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  render () {
    return (
      <Popover
        trigger='click'
        placement='bottomLeft'
        title={this.t('wallet:privateKeyImportLong')}
        visible={this.keyImport.popover === true}
        onVisibleChange={this.togglePopover}
        content={this.popoverContent()}
      >
        <Button
          disabled={this.wallet.isLocked === true}
        >
          {this.t('wallet:privateKeyImport')}
        </Button>
      </Popover>
    )
  }
}

export default KeyImport
