import React from 'react'
import { action, computed, observable, reaction } from 'mobx'

/** React bindings for i18next and MobX. */
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Ant Design components. */
import { AutoComplete, Button, Input, Popover } from 'antd'

/** Message signing and verifying component. */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class Message extends React.Component {
  /** MobX observable properties. */
  @observable address = ''
  @observable message = ''
  @observable signature = ''
  @observable verified = null
  @observable popoverVisible = false
  @observable rpcError = ''

  /** @constructor */
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet

    /**
     * Clear previous RPC error and verification status when one of the
     * parameters is updated.
     */
    reaction(
      () => [this.address, this.message, this.signature],
      ([address, message, signature]) => {
        if (this.rpcError !== '') {
          this.setValues({ rpcError: '', verified: null })
        }
      }
    )
  }

  /**
   * Get present error string or false if none.
   * @function errorStatus
   * @return {string|false} Error status.
   */
  @computed
  get errorStatus () {
    /** Check for address errors. */
    if (this.address.match(/^[a-z0-9]*$/i) === null) return 'addrChars'
    if (this.address.length < 34) return 'addrShort'
    if (this.address.length > 35) return 'addrLong'

    /** Check for signature errors. */
    if (this.signature.match(/^[a-z0-9+/=]*$/i) === null) return 'sigChars'
    if (this.signature !== '' && this.signature.length < 88) return 'sigShort'
    if (this.signature.length > 88) return 'sigLong'

    /** Check for RPC error. */
    if (this.rpcError !== '') return this.rpcError
    return false
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
   * Toggle popover visibility only when the wallet is unlocked.
   * @function togglePopover
   */
  @action
  togglePopover = () => {
    if (this.wallet.isLocked === false) {
      this.popoverVisible = !this.popoverVisible
    }
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
          this.setValues({ signature: response[0].result, verified: true })
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** error_code_wallet_error */
            case -4:
              return this.setValues({ rpcError: 'unknownAddress' })

            /** error_code_invalid_address_or_key */
            case -5:
              return this.setValues({ rpcError: 'invalidAddress' })
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
      [{ method: 'verifymessage', params: [this.address, this.signature, this.message] }],
      response => {
        /** Set verified status. */
        if (response[0].hasOwnProperty('result') === true) {
          this.setValues({ verified: response[0].result })
        }

        /** Set error. */
        if (response[0].hasOwnProperty('error') === true) {
          switch (response[0].error.code) {
            /** error_code_wallet_error */
            case -4:
              return this.setValues({ rpcError: 'unknownAddress' })

            /** error_code_invalid_address_or_key */
            case -5:
              return this.setValues({ rpcError: 'invalidAddress' })
          }
        }
      }
    )
  }

  /**
   * Render the message signing component.
   * @function render
   */
  render = () => {
    const showErrors = ['addrChars', 'addrInvalid', 'addrUnknown', 'sigChars']

    return (
      <Popover
        content={
          <div style={{ width: '400px' }}>
            <AutoComplete
              dataSource={this.wallet.addressList}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onChange={address => this.setValues({ address })}
              placeholder={this.t('wallet:addr')}
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
                  : this.verified === true
                    ? 'border-green'
                    : 'border-red'
              }
              onChange={e => this.setValues({ signature: e.target.value })}
              placeholder={this.t('wallet:msgSignature')}
              style={{ margin: '5px 0 5px 0' }}
              value={this.signature}
            />
            <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
              <p className='red'>
                {showErrors.includes(this.errorStatus) === true &&
                  this.t('wallet:' + this.errorStatus)}
              </p>
              {(this.signature === '' &&
                <Button
                  disabled={this.errorStatus !== false}
                  onClick={this.signMessage}
                >
                  {this.t('wallet:msgSign')}
                </Button>
              ) ||
                <Button
                  disabled={this.errorStatus !== false}
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
        <Button disabled={this.wallet.isLocked === true} size='small'>
          <i className='flex-center material-icons md-16'>fingerprint</i>
        </Button>
      </Popover>
    )
  }
}

export default Message
