import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row, Tooltip } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet', 'walletUnlock') @observer

class WalletUnlock extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.walletUnlock = props.walletUnlock
    this.walletpassphrase = this.walletpassphrase.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  walletpassphrase () {
    this.walletUnlock.walletpassphrase()
  }

  setPassphrase (e) {
    this.walletUnlock.setPassphrase(e.target.value)
  }

  togglePopover () {
    this.walletUnlock.togglePopover()
  }

  popoverContent () {
    /** Destructure properties. */
    const {
      errorStatus,
      passphrase
    } = this.walletUnlock

    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24}>
            <Input
              type='password'
              placeholder={this.t('wallet:passphraseLong')}
              value={passphrase}
              onChange={this.setPassphrase}
            />
          </Col>
        </Row>
        <Row>
          <Col span={14}>
            <p className='text-error'>
              {
                errorStatus === 'incorrectPassphrase' &&
                this.t('wallet:passphraseIncorrect')
              }
            </p>
          </Col>
          <Col span={10} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.walletpassphrase}
              disabled={errorStatus !== false}
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
        visible={this.walletUnlock.popover === true}
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
