import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row, Tooltip } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletUnlock extends React.Component {
  @observable passphrase = ''
  @observable popover = false
  @observable error = false

  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.unlock = this.unlock.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.togglePopover = this.togglePopover.bind(this)

    /** Clear previous error on passphrase change. */
    reaction(() => this.passphrase, (passphrase) => {
      if (this.error !== false) {
        this.setError()
      }
    })

    /** Clear passphrase on popover closure. */
    reaction(() => this.popover, (popover) => {
      if (popover === false) {
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

  @action togglePopover () {
    this.popover = !this.popover
  }

  unlock () {
    this.wallet.unlock(this.passphrase, (result, error) => {
      if (result !== undefined) {
        this.togglePopover()
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
      </div>
    )
  }

  render () {
    if (this.wallet.isLocked === false) return null
    return (
      <Popover
        title={this.t('wallet:unlock')}
        trigger='click'
        placement='bottomRight'
        content={this.popoverContent()}
        visible={this.popover === true}
      >
        <Tooltip
          title={this.t('wallet:locked')}
          placement='bottomRight'
        >
          <Button
            type='primary'
            size='small'
            onClick={this.togglePopover}
          >
            <i className='material-icons md-20'>lock</i>
          </Button>
        </Tooltip>
      </Popover>
    )
  }
}

export default WalletUnlock
