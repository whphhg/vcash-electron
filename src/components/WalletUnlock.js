import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, extendObservable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'
import Modal from 'antd/lib/modal'
import Tooltip from 'antd/lib/tooltip'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'walletNext')
@observer
class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.walletNext

    /** Extend the component with observable properties. */
    extendObservable(this, {
      passphrase: '',
      rpcError: '',
      modalVisible: false
    })

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
  get errorStatus() {
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
    Object.keys(values).forEach(key => {
      this[key] = values[key]
    })
  }

  /**
   * Toggle modal's visibility.
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
  async walletPassphrase() {
    const res = await this.rpc.walletPassphrase(this.passphrase)

    if ('result' in res === true) {
      /** Update wallet's lock status. */
      this.wallet.updateLockStatus()

      /** Hide modal. */
      this.toggleModal()

      /** Display a success message for 6s. */
      message.success(this.t('wallet:unlocked'), 6)
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -14:
          return this.setValues({ rpcError: 'passphraseIncorrect' })
      }
    }
  }

  render() {
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
            type="password"
            value={this.passphrase}
          />
          <div className="flex-sb">
            <p className="red">
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
        <Tooltip placement="bottomRight" title={this.t('wallet:locked')}>
          <Button onClick={this.toggleModal}>
            <i className="material-icons md-20">lock</i>
          </Button>
        </Tooltip>
      </div>
    )
  }
}

export default WalletUnlock
