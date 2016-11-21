import React from 'react'
import { observer } from 'mobx-react'
import { Button, Col, Input, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['wallet', 'walletPassphraseChange'])

class WalletPassphraseChange extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletPassphraseChange = props.walletPassphraseChange
    this.walletpassphrasechange = this.walletpassphrasechange.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
  }

  walletpassphrasechange() {
    this.walletPassphraseChange.walletpassphrasechange()
  }

  setPassphrase(event) {
    this.walletPassphraseChange.setPassphrase(event.target.value, event.target.name)
  }

  componentWillUnmount() {
    this.walletPassphraseChange.setPassphrase('', 'oldPassphrase')
    this.walletPassphraseChange.setPassphrase('', 'newPassphrase')
    this.walletPassphraseChange.setPassphrase('', 'repeat')
  }

  render() {
    return (
      <div>
        <p style={{margin:'0 0 5px 0'}}>
          <i className='material-icons md-18'>vpn_key</i>
          <span className='text-icon'>Change wallet passphrase</span>
        </p>
        <Row>
          <Col span={3}>
            <p style={{margin:'4px 0 0 0'}}>Current</p>
            <p style={{margin:'14px 0 0 0'}}>New</p>
            <p style={{margin:'14px 0 0 0'}}>Repeat</p>
          </Col>
          <Col span={21}>
            <Input name='oldPassphrase' type='text' placeholder='Current passphrase' value={this.walletPassphraseChange.oldPassphrase} onChange={this.setPassphrase} />
            <Input name='newPassphrase' type='text' placeholder='New passphrase' style={{margin:'5px 0 0 0'}} value={this.walletPassphraseChange.newPassphrase} onChange={this.setPassphrase} />
            <Input name='repeat' type='text' placeholder='Repeat passphrase' style={{margin:'5px 0 0 0'}} value={this.walletPassphraseChange.repeat} onChange={this.setPassphrase} />
          </Col>
        </Row>
        <Row>
          <Col offset={3} span={14}>
            {
              this.walletPassphraseChange.errorStatus === 'notMatching' && (
                <p className='text-error'>The passphrases you have entered do not match.</p>
              ) ||
              this.walletPassphraseChange.errorStatus === 'incorrectPassphrase' && (
                <p className='text-error'>The current passphrase you have entered is incorrect.</p>
              ) ||
              this.walletPassphraseChange.errorStatus === 'sameAsBefore' && (
                <p className='text-error'>The current passphrase you have entered is the same as the new one.</p>
              )
            }
          </Col>
          <Col span={7} className='text-right' style={{margin:'5px 0 0 0'}}>
            <Button onClick={this.walletpassphrasechange} disabled={this.walletPassphraseChange.errorStatus !== false || this.wallet.isEncrypted === false}>Change passphrase</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default WalletPassphraseChange
