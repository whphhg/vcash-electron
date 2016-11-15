import React from 'react'
import { observer } from 'mobx-react'
import { Button, Col, Input, Modal, Row, Tooltip } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['wallet', 'walletEncrypt'])

class WalletEncrypt extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletEncrypt = props.walletEncrypt
    this.encryptwallet = this.encryptwallet.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.setRepeat = this.setRepeat.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  }

  encryptwallet() {
    this.walletEncrypt.encryptwallet()
    this.walletEncrypt.toggleModal()
  }

  setPassphrase(event) {
    this.walletEncrypt.setPassphrase(event.target.value)
  }

  setRepeat(event) {
    this.walletEncrypt.setRepeat(event.target.value)
  }

  toggleModal() {
    this.walletEncrypt.toggleModal()
  }

  modalFooter() {
    return (
      <Row>
        <Col span={24} className='text-right'>
          <Button onClick={this.toggleModal} style={{marginTop:'1px'}}>Cancel</Button>
          <Button onClick={this.encryptwallet} disabled={this.walletEncrypt.errorStatus !== false} type='primary'>Encrypt</Button>
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <div>
        <Modal title='Encrypt the wallet' visible={this.walletEncrypt.modal === true} footer={this.modalFooter()}>
          <Row>
            <Col span={6}>
              <p><i className='material-icons md-20'>vpn_key</i> <span className='input-label'>Passphrase</span></p>
              <p className='input-spacing'><i className='material-icons md-20'>vpn_key</i> <span className='input-label'>Repeat</span></p>
            </Col>
            <Col span={18}>
              <Input type='text' placeholder='Enter passphrase' value={this.walletEncrypt.passphrase} onChange={this.setPassphrase} />
              <Input type='text' placeholder='Repeat passphrase' value={this.walletEncrypt.repeat} onChange={this.setRepeat} className='input-spacing' />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              {
                this.walletEncrypt.errorStatus === 'notMatching' && (
                  <p className='error-text'>The passphrases you have entered do not match. Please try again.</p>
                )
              }
            </Col>
          </Row>
        </Modal>

        {
          this.wallet.isEncrypted === false && this.wallet.isLocked === false && (
            <Tooltip placement='bottomRight' title='Wallet is not encrypted'>
              <Button size='small' type='primary' onClick={this.toggleModal}>
                <i className='material-icons md-20'>vpn_key</i>
              </Button>
            </Tooltip>
          )
        }
      </div>
    )
  }
}

export default WalletEncrypt
