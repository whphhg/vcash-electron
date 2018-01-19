import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import notification from 'antd/lib/notification'

@translate(['common'])
@inject('rpc', 'wallet')
@observer
class WalletEncrypt extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.encryptWallet = this.encryptWallet.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['ppNotMatching']

    /** Extend the component with observable properties. */
    extendObservable(this, { passphrase: '', repeat: '' })
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus() {
    const len = { pass: this.passphrase.length, repeat: this.repeat.length }

    if (len.pass < 1 || len.repeat < 1) return 'emptyFields'
    if (len.pass !== len.repeat) return 'differentLengths'
    if (this.passphrase !== this.repeat) return 'ppNotMatching'
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
   * Encrypt the wallet.
   * @function encryptWallet
   */
  async encryptWallet() {
    const res = await this.rpc.encryptWallet(this.passphrase)

    if ('result' in res === true) {
      this.wallet.updateLockStatus()
      this.setProps({ passphrase: '', repeat: '' })

      /** Display a non-expiring restart notification. */
      notification.success({
        message: this.t('encrypted'),
        description: this.t('encryptedDesc'),
        duration: 0
      })
    }
  }

  render() {
    /** Do not render if the wallet is encrypted. */
    if (this.wallet.isEncrypted === true) return null
    return (
      <div>
        <div className="flex">
          <i className="material-icons md-16">vpn_key</i>
          <p>{this.t('encryptDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 5px 0' }}>
          <p style={{ width: '140px' }}>{this.t('pp')}</p>
          <Input
            onChange={e => this.setProps({ passphrase: e.target.value })}
            placeholder={this.t('ppDesc')}
            style={{ flex: 1 }}
            type="password"
            value={this.passphrase}
          />
        </div>
        <div className="flex-sb">
          <p style={{ width: '140px' }}>{this.t('ppRepeat')}</p>
          <Input
            onChange={e => this.setProps({ repeat: e.target.value })}
            placeholder={this.t('ppRepeatDesc')}
            style={{ flex: 1 }}
            type="password"
            value={this.repeat}
          />
        </div>
        <div className="flex-sb" style={{ margin: '10px 0 0 0' }}>
          <p className="red" style={{ margin: '0 0 0 140px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t(this.errorStatus)}
          </p>
          <Button
            disabled={this.errorStatus !== ''}
            onClick={this.encryptWallet}
          >
            {this.t('encrypt')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletEncrypt
