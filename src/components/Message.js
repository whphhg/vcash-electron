import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { action, computed, observable, reaction } from 'mobx'
import { AutoComplete, Button, Input, Popover } from 'antd'

/**
 * Message signing and verifying component.
 */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class Message extends React.Component {
  @observable address = ''
  @observable message = ''
  @observable signature = { value: '', setBy: '' }
  @observable verified = null
  @observable rpcError = ''
  @observable popoverVisible = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Errors that will be shown to the user. */
    this.errShow = ['addrChars', 'addrInvalid', 'addrUnknown', 'sigChars']

    /**
     * Clear previous RPC error and verification status when the user updates
     * the address or message.
     */
    reaction(
      () => [this.address, this.message],
      ([address, message]) => {
        if (this.rpcError !== '' || this.verified !== null) {
          this.setValues({ rpcError: '', verified: null })
        }
      }
    )

    /**
     * Clear verification status when the user updates the signature.
     */
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

    /** Check for errors in the entered address. */
    if (this.address.match(/^[a-z0-9]*$/i) === null) return 'addrChars'
    if (this.address.length < 34) return 'addrShort'
    if (this.address.length > 35) return 'addrLong'

    /** Check for errors in the entered signature. */
    if (signature.match(/^[a-z0-9+/=]*$/i) === null) return 'sigChars'
    if (signature !== '' && signature.length < 88) return 'sigShort'
    if (signature.length > 88) return 'sigLong'

    /** Check for RPC error or return empty string if none. */
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

    /** Set only values of allowed properties. */
    Object.keys(values).forEach(key => {
      if (allowed.includes(key) === true) {
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
  signMessage = () => {
    this.rpc.execute(
      [{ method: 'signmessage', params: [this.address, this.message] }],
      response => {
        /** Set signature. */
        if (response[0].hasOwnProperty('result') === true) {
          this.setValues({
            signature: { value: response[0].result, setBy: 'rpc' },
            verified: true
          })
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** failed to get key id */
            case -3:
              return this.setValues({ rpcError: 'addrUnknown' })

            /** invalid address */
            case -5:
              return this.setValues({ rpcError: 'addrInvalid' })
          }
        }
      }
    )
  }

  /**
   * Verify the message was signed by the address's private key.
   * @function verifyMessage
   */
  verifyMessage = () => {
    this.rpc.execute(
      [
        {
          method: 'verifymessage',
          params: [this.address, this.signature.value, this.message]
        }
      ],
      response => {
        /** Set verified status. */
        if (response[0].hasOwnProperty('result') === true) {
          this.setValues({ verified: response[0].result })
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** invalid address */
            case -5:
              return this.setValues({ rpcError: 'addrInvalid' })
          }
        }
      }
    )
  }

  render = () =>
    <Popover
      content={
        <div style={{ width: '400px' }}>
          <AutoComplete
            dataSource={this.wallet.addressList}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            onChange={address => this.setValues({ address })}
            placeholder={this.t('wallet:address')}
            style={{ width: '100%' }}
            value={this.address}
          />
          <Input.TextArea
            autosize={{ minRows: 3 }}
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
            {(this.signature.value === '' &&
              <Button
                disabled={
                  this.errorStatus !== '' || this.wallet.isLocked === true
                }
                onClick={this.signMessage}
              >
                {this.t('wallet:msgSign')}
              </Button>) ||
              <Button
                disabled={this.errorStatus !== ''}
                onClick={this.verifyMessage}
              >
                {this.t('wallet:msgVerify')}
              </Button>}
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
}

export default Message
