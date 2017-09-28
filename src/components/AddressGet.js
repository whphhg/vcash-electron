import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, extendObservable, reaction } from 'mobx'
import { AutoComplete, Button, Input, Popover } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class AddressGet extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, {
      account: '',
      address: '',
      rpcError: '',
      popoverVisible: false
    })

    /** Bind the async function. */
    this.getNewAddress = this.getNewAddress.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['accChars', 'keypoolRanOut']

    /** Clear new address when the popover gets hidden. */
    reaction(
      () => this.popoverVisible,
      popoverVisible => {
        if (popoverVisible === false) {
          if (this.address !== '') this.setValues({ address: '' })
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
    if (this.account.match(/^[a-z0-9 -]*$/i) === null) return 'accChars'
    if (this.account.length > 100) return 'accLength'
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
  async getNewAddress () {
    const response = await this.rpc.getNewAddress(this.account)

    if ('result' in response === true) {
      /** Set new receiving address. */
      this.setValues({ address: response.result })

      /** Update wallet's address list. */
      this.wallet.getWallet(false, true)
    }

    if ('error' in response === true) {
      switch (response.error.code) {
        case -12:
          return this.setValues({ rpcError: 'keypoolRanOut' })
      }
    }
  }

  render () {
    return (
      <Popover
        content={
          <div style={{ width: '400px' }}>
            <AutoComplete
              dataSource={this.wallet.accounts}
              filterOption
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onChange={account => this.setValues({ account })}
              placeholder={this.t('wallet:accName')}
              style={{ width: '100%' }}
              value={this.account}
            />
            {this.address !== '' && (
              <Input
                className='green'
                readOnly
                style={{ margin: '5px 0 0 0' }}
                value={this.address}
              />
            )}
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
    )
  }
}

export default AddressGet
