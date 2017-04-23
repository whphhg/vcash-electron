import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Input, Popover } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rpc', 'wallet') @observer

export default class AddressNew extends React.Component {
  @observable account = ''
  @observable address = ''
  @observable error = false
  @observable popover = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear address when the popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false && this.address !== '') this.setAddress()
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
        <AutoComplete
          dataSource={this.wallet.accounts}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          onChange={this.setAccount}
          placeholder={this.t('wallet:accountName')}
          style={{width: '100%'}}
          value={this.account}
        />
        {
          this.address !== '' && (
            <Input readOnly style={{margin: '5px 0 0 0'}} value={this.address} />
          )
        }
        <div
          className='flex-sb'
          style={{alignItems: 'flex-start', margin: '5px 0 0 0'}}
        >
          <p className='red'>
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
          <Button disabled={this.errorStatus !== false} onClick={this.getNew}>
            {this.t('wallet:addressGenerate')}
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
        title={this.t('wallet:addressGenerateLong')}
        trigger='click'
        visible={this.popover}
      >
        <Button size='small'>{this.t('wallet:addressGenerate')}</Button>
      </Popover>
    )
  }
}
