import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('addresses', 'wallet') @observer

export default class KeyImport extends React.Component {
  @observable privateKey = ''
  @observable account = ''
  @observable loading = false
  @observable popover = false
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.addresses = props.addresses
    this.wallet = props.wallet
    this.importKey = this.importKey.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.setPrivateKey = this.setPrivateKey.bind(this)
    this.togglePopover = this.togglePopover.bind(this)

    /** Clear previous RPC response errors on private key change. */
    reaction(() => this.privateKey, (privateKey) => {
      if (privateKey !== '') {
        this.setError()
      }
    })

    /** Clear private key when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.privateKey !== '') {
          this.setPrivateKey()
        }
      }
    })
  }

  @computed get errorStatus () {
    if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) {
      return 'invalidCharacters'
    }

    if (this.privateKey.length < 51) return 'incompleteKey'
    if (this.error !== false) return this.error
    return false
  }

  @action setError (error = false) {
    this.error = error
  }

  @action setAccount (account) {
    this.account = account
  }

  @action setPrivateKey (e) {
    if (e === undefined) {
      this.privateKey = ''
    } else {
      if (e.target.value.match(/^[a-zA-Z0-9]{0,52}$/) !== null) {
        this.privateKey = e.target.value
      }
    }
  }

  @action toggleLoading () {
    this.loading = !this.loading
  }

  @action togglePopover () {
    this.popover = !this.popover
  }

  importKey () {
    /** Disable the button and show the loading indicator. */
    this.toggleLoading()

    this.addresses.importKey(this.privateKey, this.account, (result, error) => {
      /** Re-enable the button and hide the loading indicator. */
      this.toggleLoading()

      if (result !== undefined) {
        if (this.popover === true) {
          this.togglePopover()
        }
      }

      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  popoverContent () {
    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24}>
            <Input
              style={{margin: '0 0 5px 0'}}
              placeholder={this.t('wallet:privateKey')}
              value={this.privateKey}
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
              value={this.account}
              dataSource={this.addresses.accounts}
              onChange={this.setAccount}
            />
          </Col>
        </Row>
        <Row>
          <Col span={14}>
            <p className='text-error'>
              {
                (
                  this.errorStatus === 'invalidCharacters' &&
                  this.t('wallet:accountInvalidCharacters')
                ) || (
                  this.errorStatus === 'invalidKey' &&
                  this.t('wallet:privateKeyInvalid')
                ) || (
                  this.errorStatus === 'isMine' &&
                  this.t('wallet:privateKeyIsMine')
                )
              }
            </p>
          </Col>
          <Col span={10} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.importKey}
              disabled={this.errorStatus !== false}
              loading={this.loading === true}
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
        visible={this.popover === true}
        onVisibleChange={this.togglePopover}
        content={this.popoverContent()}
      >
        <Button
          disabled={this.wallet.isLocked === true}
          size='small'
        >
          {this.t('wallet:privateKeyImport')}
        </Button>
      </Popover>
    )
  }
}
