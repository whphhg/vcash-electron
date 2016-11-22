import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Col, Input, Popover, Row, Tooltip } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('wallet', 'walletUnlock') @observer

class WalletUnlock extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletUnlock = props.walletUnlock
    this.walletpassphrase = this.walletpassphrase.bind(this)
    this.setPassphrase = this.setPassphrase.bind(this)
    this.togglePopover = this.togglePopover.bind(this)
  }

  walletpassphrase() {
    this.walletUnlock.walletpassphrase()
  }

  setPassphrase(event) {
    this.walletUnlock.setPassphrase(event.target.value)
  }

  togglePopover() {
    this.walletUnlock.togglePopover()
  }

  popoverContent() {
    return (
      <div style={{width: '400px'}}>
        <Row>
          <Col span={24}>
            <Input
              type='password'
              placeholder='Enter passphrase'
              value={this.walletUnlock.passphrase}
              onChange={this.setPassphrase}
            />
          </Col>
        </Row>
        <Row>
          <Col span={18}>
            {
              this.walletUnlock.errorStatus === 'incorrectPassphrase' && (
                <p className='text-error'>The passphrase you have entered is incorrect.</p>
              )
            }
          </Col>
          <Col span={6} className='text-right'>
            <Button
              style={{margin: '5px 0 0 0'}}
              onClick={this.walletpassphrase}
              disabled={this.walletUnlock.errorStatus !== false}
            >
              Unlock
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <div>
        {
          this.wallet.isLocked === true && (
            <Popover
              title='Unlock the wallet'
              trigger='click'
              placement='bottomRight'
              content={this.popoverContent()}
              visible={this.walletUnlock.popover === true}
            >
              <Tooltip
                title='Wallet is locked'
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
      </div>
    )
  }
}

export default WalletUnlock
