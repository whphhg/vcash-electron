import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Modal, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['walletUnlock'])

class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
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
          <Button onClick={this.walletpassphrase} disabled={this.walletUnlock.button === false} type='primary'>Unlock</Button>
        </Col>
      </Row>
    )
  }

  render() {
    return (
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
              this.walletUnlock.errors.incorrectPass === true && (
                <p className='error-text'>The passphrase you have entered is incorrect. Please try again.</p>
              )
            }
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default WalletUnlock
