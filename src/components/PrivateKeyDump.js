import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, observable, reaction } from 'mobx'
import { AutoComplete, Button, Input, Popover } from 'antd'

/** Private key dumping component. */
@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class PrivateKeyDump extends React.Component {
  @observable address = ''
  @observable privateKey = ''
  @observable rpcError = ''
  @observable popoverVisible = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Bind the async function. */
    this.dumpPrivKey = this.dumpPrivKey.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['addrChars', 'addrInvalid', 'addrUnknown']

    /** Clear private key and previous RPC error when the address is updated. */
    reaction(
      () => this.address,
      address => {
        if (this.privateKey !== '' || this.rpcError !== '') {
          this.setValues({ privateKey: '', rpcError: '' })
        }
      }
    )

    /** Clear address and private key when the popover gets hidden. */
    reaction(
      () => this.popoverVisible,
      popoverVisible => {
        if (popoverVisible === false) {
          if (this.address !== '' || this.privateKey !== '') {
            this.setValues({ address: '', privateKey: '' })
          }
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
    if (this.address.match(/^[a-z0-9]*$/i) === null) return 'addrChars'
    if (this.address.length < 34) return 'addrShort'
    if (this.address.length > 35) return 'addrLong'
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
    const allowed = ['address', 'privateKey', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
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
   * Dump private key.
   * @function dumpPrivKey
   */
  async dumpPrivKey () {
    const response = await this.rpc.dumpPrivKey(this.address)

    if ('result' in response === true) {
      /** Set private key. */
      this.setValues({ privateKey: response.result })
    }

    if ('error' in response === true) {
      switch (response.error.code) {
        case -4:
          return this.setValues({ rpcError: 'addrUnknown' })
        case -5:
          return this.setValues({ rpcError: 'addrInvalid' })
      }
    }
  }

  render () {
    return (
      <Popover
        content={
          <div style={{ width: '400px' }}>
            <AutoComplete
              dataSource={this.wallet.addressList}
              filterOption
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onChange={address => this.setValues({ address })}
              placeholder={this.t('wallet:address')}
              style={{ width: '100%' }}
              value={this.address}
            />
            {this.privateKey !== '' && (
              <Input
                className='green'
                readOnly
                style={{ margin: '5px 0 0 0' }}
                value={this.privateKey}
              />
            )}
            <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
              <p className='red'>
                {this.errShow.includes(this.errorStatus) === true &&
                  this.t('wallet:' + this.errorStatus)}
              </p>
              <Button
                disabled={this.errorStatus !== ''}
                onClick={this.dumpPrivKey}
              >
                {this.t('wallet:pkDump')}
              </Button>
            </div>
          </div>
        }
        onVisibleChange={this.togglePopover}
        placement='bottomLeft'
        title={this.t('wallet:pkDumpDesc')}
        trigger='click'
        visible={this.popoverVisible}
      >
        <Button disabled={this.wallet.isLocked === true} size='small'>
          <i className='flex-center material-icons md-16'>arrow_upward</i>
        </Button>
      </Popover>
    )
  }
}

export default PrivateKeyDump
