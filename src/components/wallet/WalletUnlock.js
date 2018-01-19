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

@translate(['common'])
@inject('rpc', 'wallet')
@observer
class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.walletPassphrase = this.walletPassphrase.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['ppIncorrect']

    /** Extend the component with observable properties. */
    extendObservable(this, {
      passphrase: '',
      rpcError: '',
      modalVisible: false
    })

    /** Clear previous RPC error on passphrase change. */
    this.ppReaction = reaction(
      () => this.passphrase,
      passphrase => {
        if (this.rpcError !== '') this.setProps({ rpcError: '' })
      },
      { name: 'WalletUnlock: passphrase changed, clearing previous RPC error.' }
    )

    /** Clear passphrase when the modal gets hidden. */
    this.modalReaction = reaction(
      () => this.modalVisible,
      modalVisible => {
        if (modalVisible === false) {
          if (this.passphrase !== '') this.setProps({ passphrase: '' })
        }
      },
      { name: 'WalletUnlock: modal toggled, clearing previous passphrase.' }
    )
  }

  /** Dispose of reactions on component unmount. */
  componentWillUnmount() {
    this.ppReaction()
    this.modalReaction()
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
   * Set observable properties.
   * @function setProps
   * @param {object} props - Key value combinations.
   */
  @action
  setProps = props => {
    Object.keys(props).forEach(key => (this[key] = props[key]))
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
  async walletPassphrase() {
    const res = await this.rpc.walletPassphrase(this.passphrase)

    if ('result' in res === true) {
      this.wallet.updateLockStatus()
      this.toggleModal()
      message.success(this.t('unlocked'))
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -14:
          return this.setProps({ rpcError: 'ppIncorrect' })
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
          title={this.t('unlock')}
          visible={this.modalVisible === true}
        >
          <Input
            onChange={e => this.setProps({ passphrase: e.target.value })}
            onPressEnter={this.walletPassphrase}
            placeholder={this.t('ppDesc')}
            style={{ width: '100%', margin: '0 0 5px 0' }}
            type="password"
            value={this.passphrase}
          />
          <div className="flex-sb">
            <p className="red">
              {this.errShow.includes(this.errorStatus) === true &&
                this.t(this.errorStatus)}
            </p>
            <Button
              disabled={this.errorStatus !== ''}
              onClick={this.walletPassphrase}
            >
              {this.t('unlock')}
            </Button>
          </div>
        </Modal>
        <Tooltip placement="bottomRight" title={this.t('locked')}>
          <Button className="flex" onClick={this.toggleModal}>
            <i className="material-icons md-19">lock</i>
          </Button>
        </Tooltip>
      </div>
    )
  }
}

export default WalletUnlock
