import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('walletEncrypt') @observer

class WalletEncrypt extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.walletEncrypt = props.walletEncrypt
    this.encryptwallet = this.encryptwallet.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
  }

  encryptwallet () {
    this.walletEncrypt.encryptwallet()
  }

  setPassphrase (event) {
    this.walletEncrypt.setPassphrase(event.target.value, event.target.name)
  }

  render () {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>vpn_key</i>
          <span className='text-icon'>{this.t('wallet:encryptLong')}</span>
        </p>
        <Row>
          <Col span={4}>
            <p style={{margin: '4px 0 0 0'}}>{this.t('wallet:passphrase')}</p>
            <p style={{margin: '14px 0 0 0'}}>{this.t('wallet:passphraseRepeat')}</p>
          </Col>
          <Col span={20}>
            <Input
              name='passphrase'
              placeholder={this.t('wallet:passphraseLong')}
              value={this.walletEncrypt.passphrase}
              onChange={this.setPassphrase}
            />
            <Input
              name='repeat'
              placeholder={this.t('wallet:passphraseRepeatLong')}
              style={{margin: '5px 0 0 0'}}
              value={this.walletEncrypt.repeat}
              onChange={this.setPassphrase}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={4} span={13}>
            {
              this.walletEncrypt.errorStatus === 'notMatching' && (
                <p className='text-error'>{this.t('wallet:passphrasesNotMatching')}</p>
              )
            }
          </Col>
          <Col span={7} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.encryptwallet}
              disabled={this.walletEncrypt.errorStatus !== false}
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
