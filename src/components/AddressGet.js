import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, extendObservable, reaction } from 'mobx'

/** Ant Design */
import AutoComplete from 'antd/lib/auto-complete'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Popover from 'antd/lib/popover'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'walletNext')
@observer
class AddressGet extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.walletNext

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
  get errorStatus() {
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
    Object.keys(values).forEach(key => {
      this[key] = values[key]
    })
  }

  /**
   * Toggle popover's visibility.
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
  async getNewAddress() {
    const res = await this.rpc.getNewAddress(this.account)

    if ('result' in res === true) {
      /** Set new receiving address. */
      this.setValues({ address: res.result })

      /** Update account's address list. */
      this.wallet.updateAddresses([this.account])
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -12:
          return this.setValues({ rpcError: 'keypoolRanOut' })
      }
    }
  }

  render() {
    return (
      <Popover
        content={
          <div style={{ width: '400px' }}>
            <AutoComplete
              dataSource={this.wallet.accountNames}
              filterOption
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onChange={account => this.setValues({ account })}
              placeholder={this.t('wallet:accName')}
              style={{ width: '100%' }}
              value={this.account}
            />
            {this.address !== '' && (
              <Input
                className="green"
                readOnly
                style={{ margin: '5px 0 0 0' }}
                value={this.address}
              />
            )}
            <div className="flex-sb" style={{ margin: '5px 0 0 0' }}>
              <p className="red">
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
        placement="bottomLeft"
        title={this.t('wallet:addrGetDesc')}
        trigger="click"
        visible={this.popoverVisible}
      >
        <Button size="small">
          <i className="flex-center material-icons md-16">plus_one</i>
        </Button>
      </Popover>
    )
  }
}

export default AddressGet
