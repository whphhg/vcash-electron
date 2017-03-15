import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('info', 'rpc', 'wallet') @observer

export default class KeyDump extends React.Component {
  @observable address = ''
  @observable privateKey = ''
  @observable popover = false
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.info = props.info
    this.rpc = props.rpc
    this.wallet = props.wallet

    /** Clear private key and previous error on address change. */
    reaction(() => this.address, (address) => {
      if (this.privateKey !== '') {
        this.setPrivateKey()
      }

      this.setError()
    })

    /** Clear address and private key when popover closes. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
        if (this.address !== '') this.setAddress()
        if (this.privateKey !== '') this.setPrivateKey()
      }
    })
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed get errorStatus () {
    if (this.address.match(/^[a-zA-Z0-9]{0,34}$/) === null) {
      return 'invalidCharacters'
    }

    if (this.address.length < 34) return 'incompleteAddress'
    if (this.error !== false) return this.error
    return false
  }

  /**
   * Set rpc error.
   * @function setError
   * @param {string} error - RPC error.
   */
  @action setError = (error = false) => {
    this.error = error
  }

  /**
   * Set address.
   * @function setAddress
   * @param {object} address - New address.
   */
  @action setAddress = (address = '') => {
    this.address = address
  }

  /**
   * Set private key.
   * @function setPrivateKey
   * @param {string} privateKey - Private key.
   */
  @action setPrivateKey = (privateKey = '') => {
    this.privateKey = privateKey
  }

  /**
   * Toggle popover.
   * @function togglePopover
   */
  @action togglePopover = () => {
    if (this.info.isLocked === false) {
      this.popover = !this.popover
    }
  }

  /**
   * Dump private key.
   * @function dumpKey
   */
  @action dumpKey = () => {
    this.rpc.dumpKey(this.address, (result, error) => {
      if (result !== undefined) {
        this.setPrivateKey(result)
      }

      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  popoverContent () {
    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24} style={{height: '28px'}}>
            <AutoComplete
              placeholder={this.t('wallet:address')}
              style={{width: '100%'}}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={this.address}
              dataSource={this.wallet.addressList}
              onChange={this.setAddress}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {
              this.privateKey !== '' && (
                <Input
                  style={{margin: '5px 0 0 0'}}
                  value={this.privateKey}
                  readOnly
                />
              )
            }
          </Col>
        </Row>
        <Row>
          <Col span={15}>
            <p className='red' style={{margin: '3px 0 3px 1px'}}>
              {
                (
                  this.errorStatus === 'invalidCharacters' &&
                  this.t('wallet:addressInvalidCharacters')
                ) || (
                  this.errorStatus === 'unknownAddress' &&
                  this.t('wallet:addressUnknown')
                ) || (
                  this.errorStatus === 'invalidAddress' &&
                  this.t('wallet:addressInvalid')
                )
              }
            </p>
          </Col>
          <Col span={9} style={{textAlign: 'right'}}>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.dumpKey}
              disabled={this.errorStatus !== false}
            >
              {this.t('wallet:privateKeyDump')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  render () {
    return (
      <Popover
        title={this.t('wallet:privateKeyDumpLong')}
        trigger='click'
        placement='bottomLeft'
        content={this.popoverContent()}
        visible={this.popover}
        onVisibleChange={this.togglePopover}
      >
        <Button
          disabled={this.info.isLocked === true}
          size='small'
        >
          {this.t('wallet:privateKeyDump')}
        </Button>
      </Popover>
    )
  }
}
