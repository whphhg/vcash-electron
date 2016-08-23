import React from 'react'
import DevTools from 'mobx-react-devtools'
import { inject, observer } from 'mobx-react'
import { Link, IndexLink, hashHistory } from 'react-router'


import { Row, Col } from 'antd'

import { Menu, Icon, Tooltip, Button } from 'antd'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup



import DaemonStatus from './DaemonStatus'
import Transaction from './Transaction'
import WalletEncrypt from './WalletEncrypt'
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

@inject('rates')
@inject('transactions')
@inject('wallet')
@inject('walletEncrypt')
@inject('walletLock')
@inject('walletUnlock')
@observer

/**
 * TODO: Show icons if vote candidate & staking (config.dat pos:1 & unlocked).
 *       Staking (gavel, flag, flash on, rowing, loyalty).
 *       Vote candidate (thumbs up, verified user, present to all, all inclusinve,stars).
 */
class Application extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.rates = props.rates
    this.transactions = props.transactions
    this.wallet = props.wallet
    this.walletEncrypt = props.walletEncrypt
    this.walletLock = props.walletLock
    this.walletUnlock = props.walletUnlock

    this.lock = this.lock.bind(this)
    this.toggleEncrypt = this.toggleEncrypt.bind(this)
    this.toggleUnlock = this.toggleUnlock.bind(this)
    this.setView = this.setView.bind(this)

    this.selectedView = '/'
  }

  lock() {
    this.walletLock.lock()
  }

  toggleEncrypt() {
    this.walletEncrypt.toggleDialog()
  }

  toggleUnlock() {
    this.walletUnlock.toggleDialog()
  }

  setView(e) {
    this.selectedView = e.key
    hashHistory.push(this.selectedView)
  }

  componentWillReceiveProps(props) {
    this.props = props
  }

  render() {
    return (
      <div>
        {process.env.NODE_ENV === 'dev' && <DevTools />}

        <WalletEncrypt />
        <WalletLock />
        <WalletUnlock />
        <DaemonStatus />
        <Transaction />

        <header>
          <Row>
            <Col span={1}>
              <div className='logo'>
                <img src='./assets/images/logoGrey.png' />
              </div>
            </Col>

            <Col span={9}>
              <div className='balance'>
                <p>Balance</p>
                <Row>
                  <Col span={8}><p><span>{this.wallet.balance}</span> XVC</p></Col>
                  <Col span={8}><p><span>{(this.wallet.balance * this.rates.average).toFixed(8)}</span> BTC</p></Col>
                  <Col span={8}><p><span>{(this.wallet.balance * this.rates.average * this.rates.local).toFixed(2)}</span> {this.rates.localCurrency}</p></Col>
                </Row>
              </div>
            </Col>

            <Col span={13}>
              <div className='menu'>
                <Menu onClick={this.setView} selectedKeys={[this.selectedView]} mode='horizontal'>
                  <Menu.Item key="/">
                    <i className='material-icons md-18'>receipt</i> Transactions
                  </Menu.Item>
                  <Menu.Item key="send">
                    <i className='material-icons md-18'>send</i> Send
                  </Menu.Item>
                  <Menu.Item key="receive">
                    <i className='material-icons md-18'>plus_one</i> Receive
                  </Menu.Item>
                  <Menu.Item key="network">
                    <i className='material-icons md-18'>router</i> Network
                  </Menu.Item>
                  <Menu.Item key="maintenance">
                    <i className='material-icons md-18'>settings</i> Maintenance
                  </Menu.Item>
                </Menu>
              </div>
            </Col>

            <Col span={1}>
              {
                this.wallet.isLocked && this.wallet.isEncrypted &&
                (
                  <Button size='small' type='primary' onClick={this.toggleUnlock}>
                    <i className='material-icons md-18'>lock</i>
                  </Button>
                ) ||
                !this.wallet.isLocked && this.wallet.isEncrypted &&
                (
                  <Button size='small' type='primary' onClick={this.lock}>
                    <i className='material-icons md-18'>lock_open</i>
                  </Button>
                ) ||
                !this.wallet.isEncrypted && !this.wallet.isLocked &&
                (
                  <Button size='small' type='primary' onClick={this.toggleEncrypt}>
                    <i className='material-icons md-18'>vpn_key</i>
                  </Button>
                )
              }
            </Col>
          </Row>
        </header>
        <section>{this.props.children}</section>
      </div>
    )
  }
}
export default Application
