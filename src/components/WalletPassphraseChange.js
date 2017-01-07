import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet', 'walletPassphraseChange') @observer

class WalletPassphraseChange extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.walletPassphraseChange = props.walletPassphraseChange
    this.walletpassphrasechange = this.walletpassphrasechange.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
  }

  walletpassphrasechange () {
    this.walletPassphraseChange.walletpassphrasechange()
  }

  setPassphrase (e) {
    this.walletPassphraseChange.setPassphrase(e.target.value, e.target.name)
  }

  componentWillUnmount () {
    this.walletPassphraseChange.setPassphrase('', 'oldPassphrase')
    this.walletPassphraseChange.setPassphrase('', 'newPassphrase')
    this.walletPassphraseChange.setPassphrase('', 'repeat')
  }

  render () {
    /** Destructure properties. */
    const {
      errorStatus,
      newPassphrase,
      oldPassphrase,
      repeat
    } = this.walletPassphraseChange

    if (this.wallet.isEncrypted === false) return null
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>vpn_key</i>
          <span className='text-icon'>
            {this.t('wallet:passphraseChangeLong')}
          </span>
        </p>
        <Row>
          <Col span={4}>
            <p style={{margin: '4px 0 0 0'}}>
              {this.t('wallet:passphrase')}
            </p>
            <p style={{margin: '14px 0 0 0'}}>
              {this.t('wallet:passphraseNew')}
            </p>
            <p style={{margin: '14px 0 0 0'}}>
              {this.t('wallet:passphraseRepeat')}
            </p>
          </Col>
          <Col span={20}>
            <Input
              name='oldPassphrase'
              placeholder={this.t('wallet:passphraseLong')}
              value={oldPassphrase}
              onChange={this.setPassphrase}
            />
            <Input
              name='newPassphrase'
              placeholder={this.t('wallet:passphraseNewLong')}
              style={{margin: '5px 0 0 0'}}
              value={newPassphrase}
              onChange={this.setPassphrase}
            />
            <Input
              name='repeat'
              placeholder={this.t('wallet:passphraseRepeatLong')}
              style={{margin: '5px 0 0 0'}}
              value={repeat}
              onChange={this.setPassphrase}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={4} span={13}>
            <p className='text-error'>
              {
                errorStatus === 'notMatching' &&
                this.t('wallet:passphrasesNotMatching') ||

                errorStatus === 'incorrectPassphrase' &&
                this.t('wallet:passphraseIncorrect') ||

                errorStatus === 'oldEqualsNew' &&
                this.t('wallet:passphrasesEqual')
              }
            </p>
          </Col>
          <Col span={7} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.walletpassphrasechange}
              disabled={errorStatus !== false}
            >
              {this.t('wallet:passphraseChange')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletPassphraseChange
