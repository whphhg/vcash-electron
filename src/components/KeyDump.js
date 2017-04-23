import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Input, Popover } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rpc', 'wallet') @observer

export default class KeyDump extends React.Component {
  @observable address = ''
  @observable error = false
  @observable popover = false
  @observable privateKey = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear private key and previous error on address change. */
    reaction(() => this.address, (address) => {
      if (this.privateKey !== '') this.setPrivateKey()
      this.setError()
    })

    /** Clear address and private key when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.address !== '') this.setAddress()
        if (this.privateKey !== '') this.setPrivateKey()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed get errorStatus () {
    if (this.address.match(/^[a-zA-Z0-9]{0,34}$/) === null) {
      return 'invalidCharacters'
    }

    if (this.address.length < 34) return 'incompleteAddress'
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
   * Set address.
   * @function setAddress
   * @param {object} address - New address.
   */
  @action setAddress = (address = '') => {
    this.address = address
  }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Private key.
   */
  @action setPrivateKey = (privateKey = '') => {
    this.privateKey = privateKey
  }

  /**
   * Toggle visibility of popover.
   * @function togglePopover
   */
  @action togglePopover = () => {
    if (this.info.isLocked === false) this.popover = !this.popover
  }

  /**
   * Dump private key.
   * @function dumpKey
   */
  dumpKey = () => {
    this.rpc.execute([
      { method: 'dumpprivkey', params: [this.address] }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        this.setPrivateKey(response[0].result)
      }

      /** Handle error. */
      if (response[0].hasOwnProperty('error') === true) {
        /** Convert error code to string. */
        switch (response[0].error.code) {
          /** -4 = error_code_wallet_error */
          case -4:
            this.setError('unknownAddress')
            break

          /** -5 = error_code_invalid_address_or_key */
          case -5:
            this.setError('invalidAddress')
            break
        }
      }
    })
  }

  popoverContent () {
    return (
      <div style={{width: '400px'}}>
        <AutoComplete
          dataSource={this.wallet.addressList}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          onChange={this.setAddress}
          placeholder={this.t('wallet:address')}
          style={{width: '100%'}}
          value={this.address}
        />
        {
          this.privateKey !== '' && (
            <Input
              readOnly
              style={{margin: '5px 0 0 0'}}
              value={this.privateKey}
            />
          )
        }
        <div className='flex-sb' style={{margin: '5px 0 0 0'}}>
          <p className='red'>
            {
              (
                this.errorStatus === 'invalidCharacters' &&
                this.t('wallet:addressInvalidCharacters')
              ) || (
                this.errorStatus === 'unknownAddress' &&
                this.t('wallet:addressUnknown')
              ) || (
                this.errorStatus === 'invalidAddress' &&
                this.t('wallet:addressInvalid')
              )
            }
          </p>
          <Button disabled={this.errorStatus !== false} onClick={this.dumpKey}>
            {this.t('wallet:privateKeyDump')}
          </Button>
        </div>
      </div>
    )
  }

  render () {
    return (
      <Popover
        content={this.popoverContent()}
        onVisibleChange={this.togglePopover}
        placement='bottomLeft'
        title={this.t('wallet:privateKeyDumpLong')}
        trigger='click'
        visible={this.popover}
      >
        <Button disabled={this.info.isLocked === true} size='small'>
          {this.t('wallet:privateKeyDump')}
        </Button>
      </Popover>
    )
  }
}
