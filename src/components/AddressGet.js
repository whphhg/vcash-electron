import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, observable, reaction } from 'mobx'
import { AutoComplete, Button, Input, Popover } from 'antd'

/**
 * New receiving address assigning component.
 */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class AddressGet extends React.Component {
  @observable account = ''
  @observable address = ''
  @observable rpcError = ''
  @observable popoverVisible = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Errors that will be shown to the user. */
    this.errShow = ['accChars', 'keypoolRanOut']

    /** Clear new address when the popover gets hidden. */
    reaction(
      () => this.popoverVisible,
      popoverVisible => {
        if (popoverVisible === false && this.address !== '') {
          this.setValues({ address: '' })
        }
      }
    )
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus () {
    /** Check for errors in the entered account name. */
    if (this.account.match(/^[a-z0-9 -]*$/i) === null) return 'accChars'
    if (this.account.length > 100) return 'accLength'

    /** Check for RPC error or return empty string if none. */
    if (this.rpcError !== '') return this.rpcError
    return ''
  }

  /**
   * Set value(s) of observable properties.
   * @function setValues
   * @param {object} values - Key value combinations.
   */
  @action
  setValues = values => {
    const allowed = ['account', 'address', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
  }

  /**
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action
  togglePopover = () => {
    this.popoverVisible = !this.popoverVisible
  }

  /**
   * Get new receiving address.
   * @function getNewAddress
   */
  getNewAddress = () => {
    this.rpc.execute(
      [{ method: 'getnewaddress', params: [this.account] }],
      response => {
        /** Set new receiving address and update wallet addresses. */
        if (response[0].hasOwnProperty('result') === true) {
          this.setValues({ address: response[0].result })
          this.wallet.getWallet(false, true)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** error_code_wallet_keypool_ran_out */
            case -12:
              return this.setValues({ rpcError: 'keypoolRanOut' })
          }
        }
      }
    )
  }

  render = () =>
    <Popover
      content={
        <div style={{ width: '400px' }}>
          <AutoComplete
            dataSource={this.wallet.accounts}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            onChange={account => this.setValues({ account })}
            placeholder={this.t('wallet:accName')}
            style={{ width: '100%' }}
            value={this.account}
          />
          {this.address !== '' &&
            <Input
              className='green'
              readOnly
              style={{ margin: '5px 0 0 0' }}
              value={this.address}
            />}
          <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
            <p className='red'>
              {this.errShow.includes(this.errorStatus) === true &&
                this.t('wallet:' + this.errorStatus)}
            </p>
            <Button
              disabled={this.errorStatus !== ''}
              onClick={this.getNewAddress}
            >
              {this.t('wallet:addrGet')}
            </Button>
          </div>
        </div>
      }
      onVisibleChange={this.togglePopover}
      placement='bottomLeft'
      title={this.t('wallet:addrGetDesc')}
      trigger='click'
      visible={this.popoverVisible}
    >
      <Button size='small'>
        <i className='flex-center material-icons md-16'>plus_one</i>
      </Button>
    </Popover>
}

export default AddressGet
