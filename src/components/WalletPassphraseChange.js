import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'

/** Wallet passphrase changing component. */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletPassphraseChange extends React.Component {
  @observable current = ''
  @observable next = ''
  @observable repeat = ''
  @observable rpcError = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Errors that will be shown to the user. */
    this.errShow = [
      'passphraseIncorrect',
      'passphrasesEqual',
      'passphrasesNotMatching'
    ]

    /** Clear previous RPC error on current passphrase change. */
    reaction(
      () => this.current,
      current => {
        if (this.rpcError !== false) {
          this.setValues({ rpcError: '' })
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
    const len = {
      old: this.current.length,
      next: this.next.length,
      repeat: this.repeat.length
    }

    if (len.old < 1 || len.next < 1 || len.repeat < 1) return 'emptyFields'
    if (this.next === this.current) return 'passphrasesEqual'
    if (len.next !== len.repeat) return 'differentLengths'
    if (this.next !== this.repeat) return 'passphrasesNotMatching'
    if (this.rpcError !== '') return this.rpcError
    return ''
  }

  /**
   * Clear entered passphrases.
   * @function clear
   */
  @action
  clear = () => {
    this.setValues({ current: '', next: '', repeat: '' })
  }

  /**
   * Set value(s) of observable properties.
   * @function setValues
   * @param {object} values - Key value combinations.
   */
  @action
  setValues = values => {
    const allowed = ['current', 'next', 'repeat', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
  }

  /**
   * Change wallet's passphrase.
   * @function walletPassphraseChange
   */
  walletPassphraseChange = () => {
    this.rpc.execute(
      [{ method: 'walletpassphrasechange', params: [this.current, this.next] }],
      response => {
        if (response[0].hasOwnProperty('result') === true) {
          /** Update wallet's lock status. */
          this.wallet.getLockStatus()

          /** Clear entered passphrases. */
          this.clear()

          /** Display a success message for 6 seconds. */
          message.success(this.t('wallet:passphraseChanged'), 6)
        }

        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            case -14:
              return this.setValues({ rpcError: 'passphraseIncorrect' })
          }
        }
      }
    )
  }

  render () {
    /** Do not render if the wallet is not encrypted. */
    if (this.wallet.isEncrypted === false) return null
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>vpn_key</i>
          <p>
            {this.t('wallet:passphraseChangeLong')}
          </p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>
            {this.t('wallet:passphrase')}
          </p>
          <Input
            onChange={e => this.setValues({ current: e.target.value })}
            placeholder={this.t('wallet:passphraseLong')}
            style={{ flex: 1 }}
            value={this.current}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p style={{ width: '120px' }}>
            {this.t('wallet:passphraseNew')}
          </p>
          <Input
            onChange={e => this.setValues({ next: e.target.value })}
            placeholder={this.t('wallet:passphraseNewLong')}
            style={{ flex: 1 }}
            value={this.next}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p style={{ width: '120px' }}>
            {this.t('wallet:passphraseRepeat')}
          </p>
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
            onClick={this.walletPassphraseChange}
          >
            {this.t('wallet:passphraseChange')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletPassphraseChange
