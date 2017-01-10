import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('addresses') @observer

class AddressNew extends React.Component {
  @observable account = ''
  @observable address = ''
  @observable popover = false
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.addresses = props.addresses
    this.getNew = this.getNew.bind(this)
    this.setAccount = this.setAccount.bind(this)
    this.togglePopover = this.togglePopover.bind(this)

    /** Clear address when the popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.address !== '') this.setAddress()
      }
    })
  }

  @computed get errorStatus () {
    if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) {
      return 'invalidCharacters'
    }

    if (this.error !== false) return this.error
    return false
  }

  @action setError (error = false) {
    this.error = error
  }

  @action setAccount (account) {
    this.account = account
  }

  @action setAddress (address = '') {
    this.address = address
  }

  @action togglePopover () {
    this.popover = !this.popover
  }

  getNew () {
    this.addresses.getNew(this.account, (result, error) => {
      if (result !== undefined) {
        this.setAddress(result)
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
        <div>
          {
            this.address !== '' && (
              <Input
                style={{margin: '5px 0 0 0'}}
                value={this.address}
                readOnly
              />
            )
          }
        </div>
        <Row>
          <Col span={14}>
            <p className='text-error'>
              {
                this.errorStatus === 'invalidCharacters' &&
                this.t('wallet:accountInvalidCharacters') ||

                this.errorStatus === 'keypoolRanOut' &&
                this.t('wallet:keypoolRanOut')
              }
            </p>
          </Col>
          <Col span={10} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.getNew}
              disabled={this.errorStatus !== false}
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
        visible={this.popover === true}
        onVisibleChange={this.togglePopover}
      >
        <Button>{this.t('wallet:addressGenerate')}</Button>
      </Popover>
    )
  }
}

export default AddressNew
