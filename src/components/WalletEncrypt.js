import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, notification } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rpc') @observer

export default class WalletEncrypt extends React.Component {
  @observable passphrase = ''
  @observable repeat = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rpc = props.rpc
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed get errorStatus () {
    /** Get lengths only once. */
    const len = {
      pass: this.passphrase.length,
      repeat: this.repeat.length
    }

    if (len.pass < 1 || len.repeat < 1) return 'emptyFields'
    if (len.pass !== len.repeat) return 'differentLengths'
    if (this.passphrase !== this.repeat) return 'notMatching'
    return false
  }

  /**
   * Clear entered passphrases.
   * @function clear
   */
  @action clear = () => {
    this.passphrase = ''
    this.repeat = ''
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {object} e - Input element event.
   */
  @action setPassphrase = (e) => {
    this[e.target.name] = e.target.value
  }

  /**
   * Encrypt the wallet.
   * @function encrypt
   */
  encrypt = () => {
    this.rpc.execute([
      { method: 'encryptwallet', params: [this.passphrase] }
    ], (response) => {
      /** Handle result. */
      if (response[0].hasOwnProperty('result') === true) {
        /** Update lock status. */
        this.info.getLockStatus()

        /** Clear entered passphrases. */
        this.clear()

        /** Display a restart warning that can not be closed. */
        notification.success({
          message: this.t('wallet:encrypted'),
          description: this.t('wallet:encryptedLong'),
          duration: 0
        })
      }
    })
  }

  render () {
    if (this.info.isEncrypted === true) return null
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>vpn_key</i>
          <p>{this.t('wallet:encryptLong')}</p>
        </div>
        <div className='flex-sb' style={{margin: '10px 0 0 0'}}>
          <p style={{width: '120px'}}>{this.t('wallet:passphrase')}</p>
          <Input
            name='passphrase'
            onChange={this.setPassphrase}
            placeholder={this.t('wallet:passphraseLong')}
            style={{flex: 1}}
            value={this.passphrase}
          />
        </div>
        <div className='flex-sb' style={{margin: '5px 0 0 0'}}>
          <p style={{width: '120px'}}>{this.t('wallet:passphraseRepeat')}</p>
          <Input
            name='repeat'
            onChange={this.setPassphrase}
            placeholder={this.t('wallet:passphraseRepeatLong')}
            style={{flex: 1}}
            value={this.repeat}
          />
        </div>
        <div className='flex-sb' style={{margin: '5px 0 0 0'}}>
          <p className='red' style={{margin: '0 0 0 120px'}}>
            {
              this.errorStatus === 'notMatching' &&
              this.t('wallet:passphrasesNotMatching')
            }
          </p>
          <Button disabled={this.errorStatus !== false} onClick={this.encrypt}>
            {this.t('wallet:encrypt')}
          </Button>
        </div>
      </div>
    )
  }
}
