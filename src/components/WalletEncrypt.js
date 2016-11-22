import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('walletEncrypt') @observer

class WalletEncrypt extends React.Component {
  constructor(props) {
    super(props)
    this.walletEncrypt = props.walletEncrypt
    this.encryptwallet = this.encryptwallet.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
  }

  encryptwallet() {
    this.walletEncrypt.encryptwallet()
  }

  setPassphrase(event) {
    this.walletEncrypt.setPassphrase(event.target.value, event.target.name)
  }

  render() {
    return (
      <div>
        <p style={{margin: '0 0 5px 0'}}>
          <i className='material-icons md-18'>vpn_key</i>
          <span className='text-icon'>Encrypt the wallet using a passphrase for increased security</span>
        </p>
        <Row>
          <Col span={4}>
            <p style={{margin: '4px 0 0 0'}}>Passphrase</p>
            <p style={{margin: '14px 0 0 0'}}>Repeat</p>
          </Col>
          <Col span={20}>
            <Input
              name='passphrase'
              placeholder='Enter passphrase'
              value={this.walletEncrypt.passphrase}
              onChange={this.setPassphrase}
            />
            <Input
              name='repeat'
              placeholder='Repeat passphrase'
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
                <p className='text-error'>The passphrases you have entered do not match.</p>
              )
            }
          </Col>
          <Col span={7} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.encryptwallet}
              disabled={this.walletEncrypt.errorStatus !== false}
            >
              Encrypt the wallet
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletEncrypt
