import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, extendObservable, reaction } from 'mobx'

/** Ant Design */
import AutoComplete from 'antd/lib/auto-complete'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'

@translate(['wallet'])
@inject('rpc', 'wallet')
@observer
class PrivateKeyDump extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.dumpPrivKey = this.dumpPrivKey.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['addrChars', 'addrInvalid', 'addrUnknown']

    /** Extend the component with observable properties. */
    extendObservable(this, { address: '', privateKey: '', rpcError: '' })

    /** Clear private key and previous RPC error when the address is updated. */
    reaction(
      () => this.address,
      address => {
        if (this.privateKey !== '' || this.rpcError !== '') {
          this.setProps({ privateKey: '', rpcError: '' })
        }
      },
      { name: 'PrivateKeyDump: address changed, clearing key and RPC error.' }
    )
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus() {
    if (this.address.match(/^[a-z0-9]*$/i) === null) return 'addrChars'
    if (this.address.length < 34) return 'addrShort'
    if (this.address.length > 35) return 'addrLong'
    if (this.rpcError !== '') return this.rpcError
    return ''
  }

  /**
   * Set observable properties.
   * @function setProps
   * @param {object} props - Key value combinations.
   */
  @action
  setProps = props => {
    Object.keys(props).forEach(key => (this[key] = props[key]))
  }

  /**
   * Dump private key.
   * @function dumpPrivKey
   */
  async dumpPrivKey() {
    const res = await this.rpc.dumpPrivKey(this.address)

    if ('result' in res === true) {
      this.setProps({ privateKey: res.result })
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -4:
          return this.setProps({ rpcError: 'addrUnknown' })
        case -5:
          return this.setProps({ rpcError: 'addrInvalid' })
      }
    }
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="flex-center material-icons md-16">vpn_key</i>
          <p>{this.t('pkDumpDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 5px 0' }}>
          <p style={{ width: '140px' }}>{this.t('address')}</p>
          <AutoComplete
            dataSource={this.wallet.addrKeys}
            filterOption
            getPopupContainer={triggerNode => triggerNode.parentNode}
            onChange={address => this.setProps({ address })}
            placeholder={this.t('address')}
            style={{ flex: 1 }}
            value={this.address}
          />
        </div>
        <div className="flex-sb" style={{ margin: '0 0 10px 0' }}>
          <p style={{ width: '140px' }}>{this.t('pk')}</p>
          <Input
            disabled={this.privateKey === ''}
            readOnly
            style={{ flex: 1 }}
            value={this.privateKey}
          />
        </div>
        <div className="flex-sb">
          <p className="red" style={{ margin: '0 0 0 140px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t(this.errorStatus)}
          </p>
          <Button
            disabled={this.errorStatus !== '' || this.wallet.isLocked === true}
            onClick={this.dumpPrivKey}
          >
            {this.t('pkDump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default PrivateKeyDump
