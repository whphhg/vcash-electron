import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, notification } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class WalletEncrypt extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, { passphrase: '', repeat: '' })

    /** Bind the async function. */
    this.encryptWallet = this.encryptWallet.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['passphrasesNotMatching']
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus () {
    const len = { pass: this.passphrase.length, repeat: this.repeat.length }

    if (len.pass < 1 || len.repeat < 1) return 'emptyFields'
    if (len.pass !== len.repeat) return 'differentLengths'
    if (this.passphrase !== this.repeat) return 'passphrasesNotMatching'
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
   * Encrypt the wallet.
   * @function encryptWallet
   */
  async encryptWallet () {
    const res = await this.rpc.encryptWallet(this.passphrase)

    if ('result' in res === true) {
      /** Update wallet's lock status. */
      this.wallet.getLockStatus()

      /** Clear entered passphrases. */
      this.setValues({ passphrase: '', repeat: '' })

      /** Display a non-expiring restart notification. */
      notification.success({
        message: this.t('wallet:encrypted'),
        description: this.t('wallet:encryptedLong'),
        duration: 0
      })
    }
  }

  render () {
    /** Do not render if the wallet is encrypted. */
    if (this.wallet.isEncrypted === true) return null
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>vpn_key</i>
          <p>{this.t('wallet:encryptLong')}</p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>{this.t('wallet:passphrase')}</p>
          <Input
            onChange={e => this.setValues({ passphrase: e.target.value })}
            placeholder={this.t('wallet:passphraseLong')}
            style={{ flex: 1 }}
            value={this.passphrase}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p style={{ width: '120px' }}>{this.t('wallet:passphraseRepeat')}</p>
          <Input
            onChange={e => this.setValues({ repeat: e.target.value })}
            placeholder={this.t('wallet:passphraseRepeatLong')}
            style={{ flex: 1 }}
            value={this.repeat}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p className='red' style={{ margin: '0 0 0 120px' }}>
            {this.errShow.includes(this.errorStatus) === true &&
              this.t('wallet:' + this.errorStatus)}
          </p>
          <Button
            disabled={this.errorStatus !== ''}
            onClick={this.encryptWallet}
          >
            {this.t('wallet:encrypt')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletEncrypt
