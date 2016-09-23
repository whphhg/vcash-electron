import React from 'react'
import { inject, observer } from 'mobx-react'
import { Col, Input, Modal, Row } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['walletUnlock'])

class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
    this.walletUnlock = props.walletUnlock

    /** Bind functions early. */
    this.toggleModal = this.toggleModal.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.unlock = this.unlock.bind(this)
  }

  toggleModal() {
    this.walletUnlock.toggleModal()
  }

  setPassphrase(event) {
    this.walletUnlock.setPassphrase(event.target.value)
  }

  unlock() {
    this.walletUnlock.unlock()
  }

  render() {
    return (
      <Modal title='Unlock the wallet'
        visible={this.walletUnlock.modalOpen}
        okText='Unlock'
        onOk={this.unlock}
        cancelText='Cancel'
        onCancel={this.toggleModal}
      >
        <Row>
          <Col span={6}>
            <p><i className='material-icons md-20'>vpn_key</i> <span className='input-label'>Passphrase</span></p>
          </Col>

          <Col span={18}>
            <Input type='password'
              placeholder='Enter passphrase'
              value={this.walletUnlock.passphrase}
              onChange={this.setPassphrase}
              onPressEnter={this.unlock}
            />
          </Col>

          <Col span={24}>
            {
              this.walletUnlock.errors.incorrect &&
              (
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
