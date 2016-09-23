import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Input, Modal, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['walletEncrypt'])

class WalletEncrypt extends React.Component {
  constructor(props) {
    super(props)
    this.walletEncrypt = props.walletEncrypt

    /** Bind functions early. */
    this.toggleModal = this.toggleModal.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.setRepeat = this.setRepeat.bind(this)
    this.encrypt = this.encrypt.bind(this)
  }

  toggleModal() {
    this.walletEncrypt.toggleModal()
  }

  setPassphrase(event) {
    this.walletEncrypt.setPassphrase(event.target.value)
  }

  setRepeat(event) {
    this.walletEncrypt.setRepeat(event.target.value)
  }

  encrypt() {
    this.walletEncrypt.encrypt()
  }

  render() {
    return (
      <Modal title='Encrypt the wallet'
        visible={this.walletEncrypt.modalOpen}
        okText='Encrypt'
        onOk={this.encrypt}
        cancelText='Cancel'
        onCancel={this.toggleModal}
      >
        <Row>
          <Col span={6}>
            <p><i className='material-icons md-20'>vpn_key</i> <span className='input-label'>Passphrase</span></p>
            <p className='input-spacing'><i className='material-icons md-20'>vpn_key</i> <span className='input-label'>Repeat</span></p>
          </Col>

          <Col span={18}>
            <Input type='text'
              placeholder='Enter passphrase'
              value={this.walletEncrypt.passphrase}
              onChange={this.setPassphrase}
              onPressEnter={this.encrypt}
            />
            <Input type='text'
              className='input-spacing'
              placeholder='Repeat passphrase'
              value={this.walletEncrypt.repeat}
              onChange={this.setRepeat}
              onPressEnter={this.encrypt}
            />
          </Col>

          <Col span={24}>
            {
              this.walletEncrypt.errors.different &&
              (
                <p className='error-text'>The passphrases you have entered do not match. Please try again.</p>
              ) ||
              this.walletEncrypt.errors.missing &&
              (
                <p className='error-text'>One of the passphrase fields is empty. Please try again.</p>
              )
            }
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default WalletEncrypt
