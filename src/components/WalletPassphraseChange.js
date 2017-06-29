import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletPassphraseChange extends React.Component {
  @observable current = ''
  @observable error = false
  @observable next = ''
  @observable repeat = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear previous error on current passphrase change. */
    reaction(
      () => this.current,
      current => {
        if (this.error !== false) {
          this.setError()
        }
      }
    )
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed
  get errorStatus () {
    const len = {
      old: this.current.length,
      next: this.next.length,
      repeat: this.repeat.length
    }

    if (len.old < 1 || len.next < 1 || len.repeat < 1) return 'emptyFields'
    if (this.next === this.current) return 'oldEqualsNew'
    if (len.next !== len.repeat) return 'differentLengths'
    if (this.next !== this.repeat) return 'notMatching'
    if (this.error !== false) return this.error
    return false
  }

  /**
   * Clear entered passphrases.
   * @function clear
   */
  @action
  clear = () => {
    this.current = ''
    this.next = ''
    this.repeat = ''
  }

  /**
   * Set RPC error.
   * @function setError
   * @param {string} error - RPC error.
   */
  @action
  setError = (error = false) => {
    this.error = error
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {object} e - Input element event.
   */
  @action
  setPassphrase = e => {
    this[e.target.name] = e.target.value
  }

  /**
   * Change wallet passphrase.
   * @function passphraseChange
   */
  passphraseChange = () => {
    this.rpc.execute(
      [{ method: 'walletpassphrasechange', params: [this.current, this.next] }],
      response => {
        /** Update lock status, clear passes & display a success message. */
        if (response[0].hasOwnProperty('result') === true) {
          this.wallet.getLockStatus()
          this.clear()
          message.success(this.t('wallet:passphraseChanged'), 6)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** error_code_wallet_passphrase_incorrect */
            case -14:
              return this.setError('incorrectPassphrase')
          }
        }
      }
    )
  }

  render () {
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
            name='current'
            onChange={this.setPassphrase}
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
            name='next'
            onChange={this.setPassphrase}
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
            name='repeat'
            onChange={this.setPassphrase}
            placeholder={this.t('wallet:passphraseRepeatLong')}
            style={{ flex: 1 }}
            value={this.repeat}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p className='red' style={{ margin: '0 0 0 120px' }}>
            {(this.errorStatus === 'notMatching' &&
              this.t('wallet:passphrasesNotMatching')) ||
              (this.errorStatus === 'incorrectPassphrase' &&
                this.t('wallet:passphraseIncorrect')) ||
              (this.errorStatus === 'oldEqualsNew' &&
                this.t('wallet:passphrasesEqual'))}
          </p>
          <Button
            disabled={this.errorStatus !== false}
            onClick={this.passphraseChange}
          >
            {this.t('wallet:passphraseChange')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletPassphraseChange
