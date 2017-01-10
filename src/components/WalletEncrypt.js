import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletEncrypt extends React.Component {
  @observable passphrase = ''
  @observable repeat = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.encrypt = this.encrypt.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
  }

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

  @action setPassphrase (e) {
    this[e.target.name] = e.target.value
  }

  encrypt () {
    this.wallet.encrypt(this.passphrase)
  }

  render () {
    if (this.wallet.isEncrypted === true) return null
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>vpn_key</i>
          <span className='text-icon'>
            {this.t('wallet:encryptLong')}
          </span>
        </p>
        <Row>
          <Col span={4}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:passphrase')}
            </p>
            <p style={{margin: '14px 0 0 0'}}>
              {this.t('wallet:passphraseRepeat')}
            </p>
          </Col>
          <Col span={20}>
            <Input
              name='passphrase'
              placeholder={this.t('wallet:passphraseLong')}
              value={this.passphrase}
              onChange={this.setPassphrase}
            />
            <Input
              name='repeat'
              placeholder={this.t('wallet:passphraseRepeatLong')}
              style={{margin: '5px 0 0 0'}}
              value={this.repeat}
              onChange={this.setPassphrase}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={4} span={13}>
            <p className='text-error'>
              {
                this.errorStatus === 'notMatching' &&
                this.t('wallet:passphrasesNotMatching')
              }
            </p>
          </Col>
          <Col span={7} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.encrypt}
              disabled={this.errorStatus !== false}
            >
              {this.t('wallet:encrypt')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletEncrypt
