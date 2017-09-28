import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, extendObservable, reaction } from 'mobx'
import { AutoComplete, Button, Input, Popover } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class Message extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Extend the component with observable properties. */
    extendObservable(this, {
      address: '',
      message: '',
      signature: { value: '', setBy: '' },
      verified: null,
      rpcError: '',
      popoverVisible: false
    })

    /** Bind the async functions. */
    this.signMessage = this.signMessage.bind(this)
    this.verifyMessage = this.verifyMessage.bind(this)

    /** Errors that will be shown to the user. */
    this.errShow = ['addrChars', 'addrInvalid', 'addrUnknown', 'sigChars']

    /** Clear prev. RPC error and verification on address or message update. */
    reaction(
      () => [this.address, this.message],
      ([address, message]) => {
        if (this.rpcError !== '' || this.verified !== null) {
          this.setValues({ rpcError: '', verified: null })
        }
      }
    )

    /** Clear verification on signature update. */
    reaction(
      () => this.signature,
      signature => {
        if (this.verified !== null && signature.setBy === 'user') {
          this.setValues({ verified: null })
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
   * Set value(s) of observable properties.
   * @function setValues
   * @param {object} values - Key value combinations.
   */
  @action
  setValues = values => {
    const allowed = ['address', 'message', 'signature', 'rpcError', 'verified']

    /** Set only values of allowed properties that differ from the present. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true && this[key] !== values[key]) {
        this[key] = values[key]
      }
    })
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
   * Sign the message using the address's private key.
   * @function signMessage
   */
  async signMessage () {
    const response = await this.rpc.signMessage(this.address, this.message)

    if ('result' in response === true) {
      /** Set signature and verification status. */
      this.setValues({
        signature: { value: response.result, setBy: 'rpc' },
        verified: true
      })
    }

    if ('error' in response === true) {
      switch (response.error.code) {
        case -3:
          return this.setValues({ rpcError: 'addrUnknown' })
        case -5:
          return this.setValues({ rpcError: 'addrInvalid' })
      }
    }
  }

  /**
   * Verify the message was signed by the address's private key.
   * @function verifyMessage
   */
  async verifyMessage () {
    const response = await this.rpc.verifyMessage(
      this.address,
      this.signature.value,
      this.message
    )

    if ('result' in response === true) {
      /** Set verification status. */
      this.setValues({ verified: response.result })
    }

    if ('error' in response === true) {
      switch (response.error.code) {
        case -5:
          return this.setValues({ rpcError: 'addrInvalid' })
      }
    }
  }

  render () {
    return (
      <Popover
        content={
          <div style={{ width: '400px' }}>
            <AutoComplete
              dataSource={this.wallet.addressList}
              filterOption
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onChange={address => this.setValues({ address })}
              placeholder={this.t('wallet:address')}
              style={{ width: '100%' }}
              value={this.address}
            />
            <Input.TextArea
              autosize={{ minRows: 3 }}
              name='message'
              onChange={e => this.setValues({ message: e.target.value })}
              placeholder={this.t('wallet:msg')}
              style={{ margin: '5px 0 0 0' }}
              value={this.message}
            />
            <Input.TextArea
              autosize={{ minRows: 2, maxRows: 2 }}
              className={
                this.verified === null
                  ? ''
                  : this.verified === true ? 'green' : 'red'
              }
              onChange={e =>
                this.setValues({
                  signature: { value: e.target.value, setBy: 'user' }
                })}
              placeholder={this.t('wallet:msgSignature')}
              style={{ margin: '5px 0 5px 0' }}
              value={this.signature.value}
            />
            <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
              <p className='red'>
                {this.errShow.includes(this.errorStatus) === true &&
                  this.t('wallet:' + this.errorStatus)}
              </p>
              {this.signature.value === '' && (
                <Button
                  disabled={
                    this.errorStatus !== '' || this.wallet.isLocked === true
                  }
                  onClick={this.signMessage}
                >
                  {this.t('wallet:msgSign')}
                </Button>
              )}
              {this.signature.value !== '' && (
                <Button
                  disabled={this.errorStatus !== ''}
                  onClick={this.verifyMessage}
                >
                  {this.t('wallet:msgVerify')}
                </Button>
              )}
            </div>
          </div>
        }
        onVisibleChange={this.togglePopover}
        placement='bottomLeft'
        title={this.t('wallet:msgDesc')}
        trigger='click'
        visible={this.popoverVisible}
      >
        <Button size='small'>
          <i className='flex-center material-icons md-16'>fingerprint</i>
        </Button>
      </Popover>
    )
  }
}

export default Message
