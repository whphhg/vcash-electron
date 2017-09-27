import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input, message, Modal, Tooltip } from 'antd'

/** Wallet unlocking component. */
@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class WalletUnlock extends React.Component {
  @observable passphrase = ''
  @observable rpcError = ''
  @observable modalVisible = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Bind the async function. */
    this.walletPassphrase = this.walletPassphrase.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['passphraseIncorrect']

    /** Clear previous RPC error on passphrase change. */
    reaction(
      () => this.passphrase,
      passphrase => {
        if (this.rpcError !== '') this.setValues({ rpcError: '' })
      }
    )

    /** Clear passphrase when the modal gets hidden. */
    reaction(
      () => this.modalVisible,
      modalVisible => {
        if (modalVisible === false) {
          if (this.passphrase !== '') this.setValues({ passphrase: '' })
        }
      }
    )
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus () {
    if (this.passphrase.length < 1) return 'emptyField'
    if (this.rpcError !== '') return this.rpcError
    return ''
  }

  /**
   * Set value(s) of observable properties.
   * @function setValues
   * @param {object} values - Key value combinations.
   */
  @action
  setValues = values => {
    const allowed = ['passphrase', 'rpcError']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
  }

  /**
   * Toggle modal visibility.
   * @function toggleModal
   */
  @action
  toggleModal = () => {
    this.modalVisible = !this.modalVisible
  }

  /**
   * Unlock the wallet.
   * @function walletPassphrase
   */
  async walletPassphrase () {
    const response = await this.rpc.walletPassphrase(this.passphrase)

    if ('result' in response === true) {
      /** Update wallet's lock status. */
      this.wallet.getLockStatus()

      /** Hide modal. */
      this.toggleModal()

      /** Display a success message for 6s. */
      message.success(this.t('wallet:unlocked'), 6)
    }

    if ('error' in response === true) {
      switch (response.error.code) {
        case -14:
          return this.setValues({ rpcError: 'passphraseIncorrect' })
      }
    }
  }

  render () {
    /** Do not render if the wallet is unlocked. */
    if (this.wallet.isLocked === false) return null
    return (
      <div>
        <Modal
          footer={null}
          onCancel={this.toggleModal}
          title={this.t('wallet:unlock')}
          visible={this.modalVisible === true}
        >
          <Input
            onChange={e => this.setValues({ passphrase: e.target.value })}
            onPressEnter={this.walletPassphrase}
            placeholder={this.t('wallet:passphraseLong')}
            style={{ width: '100%', margin: '0 0 5px 0' }}
            type='password'
            value={this.passphrase}
          />
          <div className='flex-sb'>
            <p className='red'>
              {this.errShow.includes(this.errorStatus) === true &&
                this.t('wallet:' + this.errorStatus)}
            </p>
            <Button
              disabled={this.errorStatus !== ''}
              onClick={this.walletPassphrase}
            >
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
