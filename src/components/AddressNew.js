import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rpc', 'wallet') @observer

export default class AddressNew extends React.Component {
  @observable account = ''
  @observable address = ''
  @observable popover = false
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear address when the popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.address !== '') this.setAddress()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed get errorStatus () {
    if (this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null) {
      return 'invalidCharacters'
    }

    if (this.error !== false) return this.error
    return false
  }

  /**
   * Set RPC error.
   * @function setError
   * @param {string} error - RPC error.
   */
  @action setError = (error = false) => {
    this.error = error
  }

  /**
   * Set account.
   * @function setAccount
   * @param {string} account - Account name.
   */
  @action setAccount = (account) => {
    this.account = account
  }

  /**
   * Set address.
   * @function setAddress
   * @param {object} address - New address.
   */
  @action setAddress = (address = '') => {
    this.address = address
  }

  /**
   * Toggle popover.
   * @function togglePopover
   */
  @action togglePopover = () => {
    this.popover = !this.popover
  }

  /**
   * Get new address.
   * @function getNew
   */
  getNew = () => {
    this.rpc.execute([
      { method: 'getnewaddress', params: [this.account] }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        this.setAddress(response[0].result)

        /** Update address list. */
        this.wallet.getWallet(false, true)
      }

      /** Handle error. */
      if (response[0].hasOwnProperty('error') === true) {
        /** Convert error code to string. */
        switch (response[0].error.code) {
          /** - 12 = error_code_wallet_keypool_ran_out */
          case -12:
            this.setError('keypoolRanOut')
            break
        }
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
              dataSource={this.wallet.accounts}
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
            <p className='red' style={{margin: '3px 0 3px 1px'}}>
              {
                (
                  this.errorStatus === 'invalidCharacters' &&
                  this.t('wallet:accountInvalidCharacters')
                ) || (
                  this.errorStatus === 'keypoolRanOut' &&
                  this.t('wallet:keypoolRanOut')
                )
              }
            </p>
          </Col>
          <Col span={10} style={{textAlign: 'right'}}>
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
        visible={this.popover}
        onVisibleChange={this.togglePopover}
      >
        <Button size='small'>{this.t('wallet:addressGenerate')}</Button>
      </Popover>
    )
  }
}
