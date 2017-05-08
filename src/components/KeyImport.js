import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Input, Popover, message } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rpc', 'wallet') @observer

export default class KeyImport extends React.Component {
  @observable account = ''
  @observable error = false
  @observable loading = false
  @observable popover = false
  @observable privateKey = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear previous error on private key change. */
    reaction(() => this.privateKey, (privateKey) => {
      if (privateKey !== '') {
        this.setError()
      }
    })

    /** Clear private key when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false && this.privateKey !== '') {
        this.setPrivateKey()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed get errorStatus () {
    if (
      this.account.match(/^[a-zA-Z0-9 -]{0,100}$/) === null
    ) return 'invalidCharacters'

    if (this.privateKey.length < 51) return 'incompleteKey'
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
   * Set private key.
   * @function setPrivateKey
   * @param {object} e - Input element event.
   */
  @action setPrivateKey = (e) => {
    if (typeof e === 'undefined') {
      this.privateKey = ''
    } else {
      if (e.target.value.match(/^[a-zA-Z0-9]{0,52}$/) !== null) {
        this.privateKey = e.target.value
      }
    }
  }

  /**
   * Toggle loading.
   * @function toggleLoading
   */
  @action toggleLoading = () => {
    this.loading = !this.loading
  }

  /**
   * Toggle visibility of popover.
   * @function togglePopover
   */
  @action togglePopover = () => {
    if (this.wallet.isLocked === false) {
      this.popover = !this.popover
    }
  }

  /**
   * Import private key.
   * @function importKey
   */
  importKey = () => {
    /** Disable the button and show the loading indicator. */
    this.toggleLoading()

    this.rpc.execute([
      { method: 'importprivkey', params: [this.privateKey, this.account] }
    ], (response) => {
      /** Re-enable the button and hide the loading indicator. */
      this.toggleLoading()

      /** Close popover, update wallet & display a success message. */
      if (response[0].hasOwnProperty('result') === true) {
        if (this.popover === true) {
          this.togglePopover()
        }

        this.wallet.getWallet(true, true)
        message.success(this.t('wallet:privateKeyImported'), 6)
      }

      /** Set error. */
      if (response[0].hasOwnProperty('error') === true) {
        switch (response[0].error.code) {
          /** error_code_wallet_error */
          case -4:
            return this.setError('isMine')

          /** error_code_invalid_address_or_key */
          case -5:
            return this.setError('invalidKey')
        }
      }
    })
  }

  popoverContent () {
    return (
      <div style={{width: '400px'}}>
        <Input
          onChange={this.setPrivateKey}
          placeholder={this.t('wallet:privateKey')}
          style={{margin: '0 0 5px 0'}}
          value={this.privateKey}
        />
        <AutoComplete
          dataSource={this.wallet.accounts}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          onChange={this.setAccount}
          placeholder={this.t('wallet:accountName')}
          style={{width: '100%'}}
          value={this.account}
        />
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
                this.errorStatus === 'invalidKey' &&
                this.t('wallet:privateKeyInvalid')
              ) || (
                this.errorStatus === 'isMine' &&
                this.t('wallet:privateKeyIsMine')
              )
            }
          </p>
          <Button
            disabled={this.errorStatus !== false}
            loading={this.loading === true}
            onClick={this.importKey}
          >
            {this.t('wallet:privateKeyImport')}
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
        title={this.t('wallet:privateKeyImportLong')}
        trigger='click'
        visible={this.popover}
      >
        <Button disabled={this.wallet.isLocked === true} size='small'>
          <div style={{margin: '2px 0 0 0'}}>
            <i className='material-icons md-16'>arrow_downward</i>
          </div>
        </Button>
      </Popover>
    )
  }
}
