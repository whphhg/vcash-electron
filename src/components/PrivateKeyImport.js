import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, observable, reaction } from 'mobx'
import { AutoComplete, Button, Input, message, Popover } from 'antd'

/**
 * Private key importing component.
 */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class PrivateKeyImport extends React.Component {
  @observable account = ''
  @observable privateKey = ''
  @observable rpcError = ''
  @observable loading = false
  @observable popoverVisible = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Errors that will be shown to the user. */
    this.errShow = ['accChars', 'pkInvalid', 'pkIsMine']

    /** Clear previous RPC error when the private key is updated. */
    reaction(
      () => this.privateKey,
      privateKey => {
        if (this.rpcError !== '') {
          this.setValues({ rpcError: '' })
        }
      }
    )

    /** Clear private key when the popover gets hidden. */
    reaction(
      () => this.popoverVisible,
      popoverVisible => {
        if (popoverVisible === false && this.privateKey !== '') {
          this.setValues({ privateKey: '' })
        }
      }
    )
  }

  /**
   * Get present error string or false if none.
   * @function errorStatus
   * @return {string|false} Error status.
   */
  @computed
  get errorStatus () {
    if (this.account.match(/^[a-z0-9 -]*$/i) === null) return 'accChars'
    if (this.account.length > 100) return 'accLength'
    if (this.privateKey.match(/^[a-z0-9]*$/i) === null) return 'pkInvalid'
    if (this.privateKey.length < 51) return 'pkShort'
    if (this.privateKey.length > 52) return 'pkLong'
    if (this.rpcError !== '') return this.rpcError
    return false
  }

  /**
   * Set value(s) of observable properties.
   * @function setValues
   * @param {object} values - Key value combinations.
   */
  @action
  setValues = values => {
    const allowed = ['account', 'privateKey', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
  }

  /**
   * Toggle loading while waiting for the private key to be imported.
   * @function toggleLoading
   */
  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  /**
   * Toggle popover visibility only when the wallet is unlocked.
   * @function togglePopover
   */
  @action
  togglePopover = () => {
    if (this.wallet.isLocked === false) {
      this.popoverVisible = !this.popoverVisible
    }
  }

  /**
   * Import private key.
   * @function importPrivKey
   */
  importPrivKey = () => {
    /** Disable the button and show the loading indicator. */
    this.toggleLoading()

    this.rpc.execute(
      [{ method: 'importprivkey', params: [this.privateKey, this.account] }],
      response => {
        /** Re-enable the button and hide the loading indicator. */
        this.toggleLoading()

        /** Hide popover, update wallet and display a success message. */
        if (response[0].hasOwnProperty('result') === true) {
          if (this.popoverVisible === true) {
            this.togglePopover()
          }

          this.wallet.getWallet(true, true)
          message.success(this.t('wallet:pkImported'), 6)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** error_code_wallet_error */
            case -4:
              return this.setValues({ rpcError: 'pkIsMine' })

            /** error_code_invalid_address_or_key */
            case -5:
              return this.setValues({ rpcError: 'pkInvalid' })
          }
        }
      }
    )
  }

  render = () =>
    <Popover
      content={
        <div style={{ width: '400px' }}>
          <Input
            onChange={e => this.setValues({ privateKey: e.target.value })}
            placeholder={this.t('wallet:pk')}
            style={{ margin: '0 0 5px 0' }}
            value={this.privateKey}
          />
          <AutoComplete
            dataSource={this.wallet.accounts}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            onChange={account => this.setValues({ account })}
            placeholder={this.t('wallet:accName')}
            style={{ width: '100%' }}
            value={this.account}
          />
          <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
            <p className='red'>
              {this.errShow.includes(this.errorStatus) === true &&
                this.t('wallet:' + this.errorStatus)}
            </p>
            <Button
              disabled={this.errorStatus !== false}
              loading={this.loading === true}
              onClick={this.importPrivKey}
            >
              {this.t('wallet:pkImport')}
            </Button>
          </div>
        </div>
      }
      onVisibleChange={this.togglePopover}
      placement='bottomLeft'
      title={this.t('wallet:pkImportDesc')}
      trigger='click'
      visible={this.popoverVisible}
    >
      <Button disabled={this.wallet.isLocked === true} size='small'>
        <i className='flex-center material-icons md-16'>arrow_downward</i>
      </Button>
    </Popover>
}

export default PrivateKeyImport
