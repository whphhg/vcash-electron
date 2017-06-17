import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, Modal, Tooltip, message } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletUnlock extends React.Component {
  @observable error = false
  @observable modal = false
  @observable passphrase = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear previous error on passphrase change. */
    reaction(
      () => this.passphrase,
      passphrase => {
        if (this.error !== false) {
          this.setError()
        }
      }
    )

    /** Clear passphrase when modal closes. */
    reaction(
      () => this.modal,
      modal => {
        if (modal === false && this.passphrase !== '') {
          this.setPassphrase()
        }
      }
    )
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed
  get errorStatus () {
    if (this.passphrase.length < 1) return 'emptyField'
    if (this.error !== false) return this.error
    return false
  }

  /**
   * Set RPC error.
   * @function setError
   * @param {string} error - RPC error.
   */
  @action
  setError = (error = false) => {
    this.error = error
  }

  /**
   * Set passphrase.
   * @function setPassphrase
   * @param {object} e - Input element event.
   */
  @action
  setPassphrase = e => {
    this.passphrase = typeof e === 'undefined' ? '' : e.target.value
  }

  /**
   * Toggle modal.
   * @function toggleModal
   */
  @action
  toggleModal = () => {
    this.modal = !this.modal
  }

  /**
   * Unlock the wallet.
   * @function unlock
   */
  unlock = () => {
    this.rpc.execute(
      [{ method: 'walletpassphrase', params: [this.passphrase] }],
      response => {
        /** Update lock status, hide modal & display a success message. */
        if (response[0].hasOwnProperty('result') === true) {
          this.wallet.getLockStatus()
          this.toggleModal()
          message.success(this.t('wallet:unlocked'), 6)
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** error_code_wallet_passphrase_incorrect */
            case -14:
              return this.setError('incorrectPassphrase')
          }
        }
      }
    )
  }

  render () {
    if (this.wallet.isLocked === false) return null
    return (
      <div>
        <Modal
          footer={null}
          onCancel={this.toggleModal}
          title={this.t('wallet:unlock')}
          visible={this.modal === true}
        >
          <Input
            onChange={this.setPassphrase}
            onPressEnter={this.unlock}
            placeholder={this.t('wallet:passphraseLong')}
            style={{ width: '100%', margin: '0 0 5px 0' }}
            type='password'
            value={this.passphrase}
          />
          <div className='flex-sb'>
            <p className='red'>
              {this.errorStatus === 'incorrectPassphrase' &&
                this.t('wallet:passphraseIncorrect')}
            </p>
            <Button disabled={this.errorStatus !== false} onClick={this.unlock}>
              {this.t('wallet:unlock')}
            </Button>
          </div>
        </Modal>
        <Tooltip placement='bottomRight' title={this.t('wallet:locked')}>
          <Button onClick={this.toggleModal} size='small' type='primary'>
            <i className='material-icons md-20'>lock</i>
          </Button>
        </Tooltip>
      </div>
    )
  }
}

export default WalletUnlock
