import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, extendObservable, reaction } from 'mobx'

/** Ant Design */
import AutoComplete from 'antd/lib/auto-complete'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Popover from 'antd/lib/popover'

@translate(['common'])
@inject('rpc', 'wallet')
@observer
class Message extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.signMessage = this.signMessage.bind(this)
    this.verifyMessage = this.verifyMessage.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['addrChars', 'addrInvalid', 'addrUnknown', 'sigChars']

    /** Extend the component with observable properties. */
    extendObservable(this, {
      address: '',
      message: '',
      signature: { value: '', setBy: '' },
      verified: null,
      rpcError: '',
      popoverVisible: false
    })

    /** Clear prev. RPC error and verification on address or message update. */
    this.addrMsgReaction = reaction(
      () => [this.address, this.message],
      ([address, message]) => {
        if (this.rpcError !== '' || this.verified !== null) {
          this.setProps({ rpcError: '', verified: null })
        }
      },
      { name: 'Message: inputs changed, clearing RPC error and verification.' }
    )

    /** Clear verification on signature update. */
    this.signatureReaction = reaction(
      () => this.signature,
      signature => {
        if (this.verified !== null && signature.setBy === 'user') {
          this.setProps({ verified: null })
        }
      },
      { name: 'Message: signature changed, clearing verification.' }
    )
  }

  /** Dispose of reactions on component unmount. */
  componentWillUnmount() {
    this.addrMsgReaction()
    this.signatureReaction()
  }

  /**
   * Get present error or empty string if none.
   * @function errorStatus
   * @return {string} Error status.
   */
  @computed
  get errorStatus() {
    const signature = this.signature.value

    if (this.address.match(/^[a-z0-9]*$/i) === null) return 'addrChars'
    if (this.address.length < 34) return 'addrShort'
    if (this.address.length > 35) return 'addrLong'
    if (signature.match(/^[a-z0-9+/=]*$/i) === null) return 'sigChars'
    if (signature !== '' && signature.length < 88) return 'sigShort'
    if (signature.length > 88) return 'sigLong'
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
   * Toggle popover visibility.
   * @function togglePopover
   */
  @action
  togglePopover = () => {
    this.popoverVisible = !this.popoverVisible
  }

  /**
   * Sign the message using the address private key.
   * @function signMessage
   */
  async signMessage() {
    const res = await this.rpc.signMessage(this.address, this.message)

    if ('result' in res === true) {
      this.setProps({
        signature: { value: res.result, setBy: 'rpc' },
        verified: true
      })
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -3:
          return this.setProps({ rpcError: 'addrUnknown' })
        case -5:
          return this.setProps({ rpcError: 'addrInvalid' })
      }
    }
  }

  /**
   * Verify the message was signed by the address private key.
   * @function verifyMessage
   */
  async verifyMessage() {
    const res = await this.rpc.verifyMessage(
      this.address,
      this.signature.value,
      this.message
    )

    if ('result' in res === true) {
      this.setProps({ verified: res.result })
    }

    if ('error' in res === true) {
      switch (res.error.code) {
        case -5:
          return this.setProps({ rpcError: 'addrInvalid' })
      }
    }
  }

  render() {
    return (
      <Popover
        content={
          <div style={{ width: '400px' }}>
            <AutoComplete
              dataSource={this.wallet.addrKeys}
              filterOption
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onChange={address => this.setProps({ address })}
              placeholder={this.t('address')}
              style={{ width: '100%', margin: '0 0 5px 0' }}
              value={this.address}
            />
            <Input.TextArea
              name="message"
              onChange={e => this.setProps({ message: e.target.value })}
              placeholder={this.t('msg')}
              value={this.message}
            />
            <Input.TextArea
              className={
                this.verified === null
                  ? ''
                  : this.verified === true ? 'green' : 'red'
              }
              onChange={e =>
                this.setProps({
                  signature: { value: e.target.value, setBy: 'user' }
                })
              }
              placeholder={this.t('msgSignature')}
              style={{ margin: '5px 0 5px 0' }}
              value={this.signature.value}
            />
            <div className="flex-sb" style={{ margin: '5px 0 0 0' }}>
              <p className="red">
                {this.errShow.includes(this.errorStatus) === true &&
                  this.t(this.errorStatus)}
              </p>
              {this.signature.value === '' && (
                <Button
                  disabled={
                    this.errorStatus !== '' || this.wallet.isLocked === true
                  }
                  onClick={this.signMessage}
                >
                  {this.t('msgSign')}
                </Button>
              )}
              {this.signature.value !== '' && (
                <Button
                  disabled={this.errorStatus !== ''}
                  onClick={this.verifyMessage}
                >
                  {this.t('msgVerify')}
                </Button>
              )}
            </div>
          </div>
        }
        onVisibleChange={this.togglePopover}
        placement="topLeft"
        title={this.t('msgDesc')}
        trigger="click"
        visible={this.popoverVisible}
      >
        <Button size="small">
          <i className="flex-center material-icons md-16">fingerprint</i>
        </Button>
      </Popover>
    )
  }
}

export default Message
