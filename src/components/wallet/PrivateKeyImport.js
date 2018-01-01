import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, extendObservable, reaction } from 'mobx'

/** Ant Design */
import AutoComplete from 'antd/lib/auto-complete'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'

@translate(['wallet'])
@inject('rpc', 'wallet')
@observer
class PrivateKeyImport extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.importPrivKey = this.importPrivKey.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['accChars', 'pkInvalid', 'pkIsMine']

    /** Extend the component with observable properties. */
    extendObservable(this, {
      account: '',
      privateKey: '',
      rpcError: '',
      loading: false
    })

    /** Clear previous RPC error when the private key is updated. */
    this.pkReaction = reaction(
      () => this.privateKey,
      privateKey => {
        if (this.rpcError !== '') this.setProps({ rpcError: '' })
      },
      { name: 'PrivateKeyImport: private key changed, clearing RPC error.' }
    )
  }

  /** Dispose of reaction on component unmount. */
  componentWillUnmount() {
    this.pkReaction()
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
    if (this.privateKey.match(/^[a-z0-9]*$/i) === null) return 'pkInvalid'
    if (this.privateKey.length < 51) return 'pkShort'
    if (this.privateKey.length > 52) return 'pkLong'
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
   * Import private key.
   * @function importPrivKey
   */
  async importPrivKey() {
    /** Show the loading indicator, which will disable the button. */
    this.setProps({ loading: !this.loading })

    const res = await this.rpc.importPrivKey(this.privateKey, this.account)

    /** Hide the loading indicator, which will re-enable the button. */
    this.setProps({ loading: !this.loading })

    if ('result' in res === true) {
      this.wallet.updateAddresses()
      this.wallet.updateWallet(true)
      message.success(this.t('pkImported'))
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -4:
          return this.setProps({ rpcError: 'pkIsMine' })
        case -5:
          return this.setProps({ rpcError: 'pkInvalid' })
      }
    }
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="flex-center material-icons md-16">vpn_key</i>
          <p>{this.t('pkImportDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 5px 0' }}>
          <p style={{ width: '140px' }}>{this.t('pk')}</p>
          <Input
            onChange={e => this.setProps({ privateKey: e.target.value })}
            placeholder={this.t('pk')}
            style={{ flex: 1 }}
            value={this.privateKey}
          />
        </div>
        <div className="flex-sb">
          <p style={{ width: '140px' }}>{this.t('acc')}</p>
          <AutoComplete
            dataSource={this.wallet.accNames}
            filterOption
            getPopupContainer={triggerNode => triggerNode.parentNode}
            onChange={account => this.setProps({ account })}
            placeholder={this.t('accName')}
            style={{ flex: 1 }}
            value={this.account}
          />
        </div>
        <div className="flex-sb" style={{ margin: '10px 0 0 0' }}>
          <p className="red" style={{ margin: '0 0 0 140px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t(this.errorStatus)}
          </p>
          <Button
            disabled={this.errorStatus !== '' || this.wallet.isLocked === true}
            loading={this.loading === true}
            onClick={this.importPrivKey}
          >
            {this.t('pkImport')}
          </Button>
        </div>
      </div>
    )
  }
}

export default PrivateKeyImport
