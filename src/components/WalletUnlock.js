import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Modal, Row, Tooltip } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['wallet', 'walletUnlock'])

class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletUnlock = props.walletUnlock
    this.walletpassphrase = this.walletpassphrase.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  }

  walletpassphrase() {
    this.walletUnlock.walletpassphrase()
  }

  setPassphrase(event) {
    this.walletUnlock.setPassphrase(event.target.value)
  }

  toggleModal() {
    this.walletUnlock.toggleModal()
  }

  modalFooter() {
    return (
      <Row>
        <Col span={24} className='text-right'>
          <Button onClick={this.toggleModal} style={{marginTop:'1px'}}>Cancel</Button>
          <Button onClick={this.walletpassphrase} disabled={this.walletUnlock.errorStatus !== false} type='primary'>Unlock</Button>
        </Col>
      </Row>
    )
  }

  render() {
    return (
      <div>
        <Modal title='Unlock the wallet' visible={this.walletUnlock.modal === true} footer={this.modalFooter()}>
          <Row>
            <Col span={6}>
              <p><i className='material-icons md-20'>vpn_key</i> <span className='input-label'>Passphrase</span></p>
            </Col>
            <Col span={18}>
              <Input type='password' placeholder='Enter passphrase' value={this.walletUnlock.passphrase} onChange={this.setPassphrase} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              {
                this.walletUnlock.errorStatus === 'incorrectPassphrase' && (
                  <p className='error-text'>The passphrase you have entered is incorrect. Please try again.</p>
                )
              }
            </Col>
          </Row>
        </Modal>

        {
          this.wallet.isLocked === true && this.wallet.isEncrypted === true && (
            <Tooltip placement='bottomRight' title='Wallet is locked'>
              <Button size='small' type='primary' onClick={this.toggleModal}>
                <i className='material-icons md-20'>lock</i>
              </Button>
            </Tooltip>
          )
        }
      </div>
    )
  }
}

export default WalletUnlock
