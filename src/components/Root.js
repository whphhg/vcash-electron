import React from 'react'
import { hashHistory, IndexLink, Link } from 'react-router'
import { inject, observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { Button, Col, Icon, Menu, Popover, Row, Tooltip } from 'antd'

/** Dialog components. */
import DaemonStatus from './DaemonStatus'
import Transaction from './Transaction'
import WalletEncrypt from './WalletEncrypt'
import WalletUnlock from './WalletUnlock'

/** Make the component reactive and inject MobX stores. */
@observer(['rates', 'transactions', 'wallet', 'walletEncrypt', 'walletUnlock'])

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.transactions = props.transactions
    this.wallet = props.wallet
    this.walletEncrypt = props.walletEncrypt
    this.walletUnlock = props.walletUnlock

    /** Set active menu item. */
    this.activeRoute = '/'

    /** Bind functions early. */
    this.lock = this.lock.bind(this)
    this.toggleEncrypt = this.toggleEncrypt.bind(this)
    this.toggleUnlock = this.toggleUnlock.bind(this)
    this.setRoute = this.setRoute.bind(this)
  }

  lock() {
    this.wallet.lock()
  }

  toggleEncrypt() {
    this.walletEncrypt.toggleModal()
  }

  toggleUnlock() {
    this.walletUnlock.toggleModal()
  }

  setRoute(e) {
    this.activeRoute = e.key
    hashHistory.push(this.activeRoute)
  }

  componentWillReceiveProps(props) {
    this.props = props
  }

  render() {
    return (
      <div>
        {process.env.NODE_ENV === 'dev' && <DevTools />}

        <WalletEncrypt />
        <WalletUnlock />
        <DaemonStatus />
        <Transaction />

        <header className='shadow'>
          <Row>
            <Col span={1}>
              <div id='logo'>
                <Popover
                  trigger='click'
                  placement='bottomLeft'
                  content={
                    <div style={{width:'205px'}}>
                      <p>Vcash {this.wallet.version} &nbsp;&bull;&nbsp; Wallet {this.wallet.walletversion} &nbsp;&bull;&nbsp; UI {process.env.npm_package_version}</p>
                    </div>
                  }
                >
                  <img src='./assets/images/logoGrey.png' />
                </Popover>
              </div>
            </Col>
            <Col span={9}>
              <div id='balance'>
                <p>Balance</p>
                <Row>
                  <Col span={8}><p><span>{(this.wallet.balance).toFixed(6)}</span> XVC</p></Col>
                  <Col span={8}><p><span>{(this.wallet.balance * this.rates.average).toFixed(8)}</span> BTC</p></Col>
                  <Col span={8}><p><span>{(this.wallet.balance * this.rates.average * this.rates.local).toFixed(2)}</span> {this.rates.localCurrency}</p></Col>
                </Row>
              </div>
            </Col>
            <Col span={13}>
              <nav>
                <Menu onClick={this.setRoute} selectedKeys={[this.activeRoute]} mode='horizontal'>
                  <Menu.Item key="/"><i className='material-icons md-20'>receipt</i> Transactions</Menu.Item>
                  <Menu.Item key="send"><i className='material-icons md-20'>send</i> Send</Menu.Item>
                  <Menu.Item key="receive"><i className='material-icons md-20'>plus_one</i> Receive</Menu.Item>
                  <Menu.Item key="network"><i className='material-icons md-20'>router</i> Network</Menu.Item>
                  <Menu.Item key="maintenance"><i className='material-icons md-20'>settings</i> Maintenance</Menu.Item>
                </Menu>
              </nav>
            </Col>
            <Col span={1}>
              {
                this.wallet.isLocked && this.wallet.isEncrypted &&
                (
                  <Tooltip placement='bottomRight' title='Wallet is locked'>
                    <Button size='small' type='primary' onClick={this.toggleUnlock}>
                      <i className='material-icons md-20'>lock</i>
                    </Button>
                  </Tooltip>
                ) ||
                !this.wallet.isLocked && this.wallet.isEncrypted &&
                (
                  <Tooltip placement='bottomRight' title='Wallet is unlocked'>
                    <Button size='small' type='primary' onClick={this.lock}>
                      <i className='material-icons md-20'>lock_open</i>
                    </Button>
                  </Tooltip>
                ) ||
                !this.wallet.isEncrypted && !this.wallet.isLocked &&
                (
                  <Tooltip placement='bottomRight' title='Wallet is not encrypted'>
                    <Button size='small' type='primary' onClick={this.toggleEncrypt}>
                      <i className='material-icons md-20'>vpn_key</i>
                    </Button>
                  </Tooltip>
                )
              }
            </Col>
          </Row>
        </header>
        <main>{this.props.children}</main>
      </div>
    )
  }
}

export default Root
