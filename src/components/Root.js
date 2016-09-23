import React from 'react'
import { hashHistory, IndexLink, Link } from 'react-router'
import { inject, observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { Button, Col, Menu, Popover, Row, Tooltip } from 'antd'

/** Required components. */
import DaemonStatus from './DaemonStatus'
import Transaction from './Transaction'
import WalletEncrypt from './WalletEncrypt'
import WalletUnlock from './WalletUnlock'

/** Make the component reactive and inject MobX stores. */
@observer(['network', 'rates', 'transactions', 'wallet', 'walletEncrypt', 'walletUnlock'])

/**
 * TODO: Staking indicator if config pos:1 & unlocked (gavel, flag, flash on, rowing).
 */
class Root extends React.Component {
  constructor(props) {
    super(props)
    this.network = props.network
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
                <img src='./assets/images/logoGrey.png' />
              </div>
            </Col>
            <Col span={9}>
              <div id='balance'>
                <p>Balance</p>
                <Row>
                  <Col span={8}><p><span>{(this.wallet.balance).toFixed(6)}</span> XVC</p></Col>
                  <Col span={8}><p>~<span>{(this.wallet.balance * this.rates.average).toFixed(8)}</span> BTC</p></Col>
                  <Col span={8}><p>~<span>{(this.wallet.balance * this.rates.average * this.rates.local).toFixed(2)}</span> {this.rates.localCurrency}</p></Col>
                </Row>
              </div>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={24}>
                  <div id='indicators'>
                    <Tooltip placement='bottom' title={<p>Valid collateral <span className='font-weight-500'>{this.network.incentive.votecandidate === true ? 'of ' + this.network.incentive.collateralbalance :'not'}</span> detected</p>}>
                      <i className='material-icons md-20' style={{color:'#43464B'}}>loyalty</i>
                    </Tooltip>
                    <Tooltip placement='bottom' title={<p><span className='font-weight-500'>You {this.network.incentive.votecandidate === true ? 'are' : 'are not'}</span> a vote candidate</p>}>
                      <i className='material-icons md-20' style={{color:'#43464B'}}>verified_user</i>
                    </Tooltip>
                  </div>
                </Col>
                {
                  this.transactions.amountUnconfirmed > 0 &&
                  (
                    <Col span={8}>
                      <p>Unconfirmed</p>
                      <p><span>{this.transactions.amountUnconfirmed.toFixed(6)}</span> XVC</p>
                    </Col>
                  )
                }
                {
                  this.wallet.stake > 0 &&
                  (
                    <Col span={8}>
                      <div>
                        <p>Staking</p>
                        <p><span>{this.wallet.stake.toFixed(6)}</span> XVC</p>
                      </div>
                    </Col>
                  )
                }
                {
                  this.wallet.newmint > 0 &&
                  (
                    <Col span={8}>
                      <div>
                        <p>Immature</p>
                        <p><span>{this.wallet.newmint.toFixed(6)}</span> XVC</p>
                      </div>
                    </Col>
                  )
                }
              </Row>
            </Col>
            <Col span={6}>
              <nav>
                <Menu onClick={this.setRoute} selectedKeys={[this.activeRoute]} mode='horizontal'>
                  <Menu.Item key="/"><i className='material-icons md-20'>receipt</i></Menu.Item>
                  <Menu.Item key="send"><i className='material-icons md-20'>send</i></Menu.Item>
                  <Menu.Item key="network"><i className='material-icons md-20'>settings_input_antenna</i></Menu.Item>
                  <Menu.Item key="maintenance"><i className='material-icons md-20'>settings</i></Menu.Item>
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
