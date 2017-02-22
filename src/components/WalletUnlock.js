import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Modal, Row, Tooltip } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletUnlock extends React.Component {
  @observable passphrase = ''
  @observable modal = false
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.unlock = this.unlock.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.toggleModal = this.toggleModal.bind(this)

    /** Clear previous error on passphrase change. */
    reaction(() => this.passphrase, (passphrase) => {
      if (this.error !== false) {
        this.setError()
      }
    })

    /** Clear passphrase when modal closes. */
    reaction(() => this.modal, (modal) => {
      if (modal === false) {
        if (this.passphrase !== '') {
          this.setPassphrase()
        }
      }
    })
  }

  @computed get errorStatus () {
    if (this.passphrase.length < 1) return 'emptyField'
    if (this.error !== false) return this.error
    return false
  }

  @action setError (error = false) {
    this.error = error
  }

  @action setPassphrase (e) {
    this.passphrase = e === undefined
      ? ''
      : e.target.value
  }

  @action toggleModal () {
    this.modal = !this.modal
  }

  unlock () {
    this.wallet.unlock(this.passphrase, (result, error) => {
      if (result !== undefined) {
        this.toggleModal()
      }

      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  render () {
    if (this.wallet.isLocked === false) return null
    return (
      <div>
        <Modal
          title={this.t('wallet:unlock')}
          footer={null}
          visible={this.modal === true}
          onCancel={this.toggleModal}
        >
          <Row>
            <Col span={24}>
              <Input
                type='password'
                placeholder={this.t('wallet:passphraseLong')}
                value={this.passphrase}
                onChange={this.setPassphrase}
              />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <p className='text-error'>
                {
                  this.errorStatus === 'incorrectPassphrase' &&
                  this.t('wallet:passphraseIncorrect')
                }
              </p>
            </Col>
            <Col span={10} className='text-right'>
              <Button
                style={{margin: '5px 0 0 0'}}
                onClick={this.unlock}
                disabled={this.errorStatus !== false}
              >
                {this.t('wallet:unlock')}
              </Button>
            </Col>
          </Row>
        </Modal>
        <Tooltip
          title={this.t('wallet:locked')}
          placement='bottomRight'
        >
          <Button
            type='primary'
            size='small'
            onClick={this.toggleModal}
          >
            <i className='material-icons md-20'>lock</i>
          </Button>
        </Tooltip>
      </div>
    )
  }
}

export default WalletUnlock
