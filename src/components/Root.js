import React from 'react'
import { hashHistory } from 'react-router'
import { inject, observer } from 'mobx-react'
import { Button, Col, Menu, Popover, Row, Tooltip } from 'antd'
import DevTools from 'mobx-react-devtools'

/** Required components. */
import DaemonStatus from './DaemonStatus'
//import Transaction from './Transaction'
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
    this.lock = this.lock.bind(this)
    this.toggleEncrypt = this.toggleEncrypt.bind(this)
    this.toggleUnlock = this.toggleUnlock.bind(this)
    this.setRoute = this.setRoute.bind(this)

    /** Set active menu item. */
    this.activeRoute = '/'
  }

  lock() {
    this.wallet.walletlock()
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
                  <Col span={8}><p><span>{(this.wallet.info.balance).toFixed(6)}</span> XVC</p></Col>
                  <Col span={8}><p>~<span>{(this.wallet.info.balance * this.rates.average).toFixed(8)}</span> BTC</p></Col>
                  <Col span={8}><p>~<span>{(this.wallet.info.balance * this.rates.average * this.rates.local).toFixed(2)}</span> {this.rates.localCurrency}</p></Col>
                </Row>
              </div>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={24}>
                  <div>
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
                      this.wallet.info.stake > 0 &&
                      (
                        <Col span={8}>
                          <div>
                            <p>Staking</p>
                            <p><span>{this.wallet.info.stake.toFixed(6)}</span> XVC</p>
                          </div>
                        </Col>
                      )
                    }
                    {
                      this.wallet.info.newmint > 0 &&
                      (
                        <Col span={8}>
                          <div>
                            <p>Immature</p>
                            <p><span>{this.wallet.info.newmint.toFixed(6)}</span> XVC</p>
                          </div>
                        </Col>
                      )
                    }
                  </div>
                  <div id='indicators'>
                    <Tooltip placement='bottom' title={<p>Valid collateral <span className='font-weight-500'>{this.wallet.incentive.votecandidate === true ? 'of ' + this.wallet.incentive.collateralbalance :'not'}</span> detected</p>}>
                      <i className='material-icons md-20' style={{color:'#43464B'}}>loyalty</i>
                    </Tooltip>
                    <Tooltip placement='bottom' title={<p><span className='font-weight-500'>You {this.wallet.incentive.votecandidate === true ? 'are' : 'are not'}</span> a vote candidate</p>}>
                      <i className='material-icons md-20' style={{color:'#43464B'}}>verified_user</i>
                    </Tooltip>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <nav>
                <Menu onClick={this.setRoute} selectedKeys={[this.activeRoute]} mode='horizontal'>
                  <Menu.Item key='/'><i className='material-icons md-20'>receipt</i></Menu.Item>
                  <Menu.Item key='send'><i className='material-icons md-20'>send</i></Menu.Item>
                  <Menu.Item key='addresses'><i className='material-icons md-20'>account_balance_wallet</i></Menu.Item>
                  <Menu.Item key='network'><i className='material-icons md-20'>settings_input_antenna</i></Menu.Item>
                  <Menu.Item key='maintenance'><i className='material-icons md-20'>settings</i></Menu.Item>
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
        <div className='footer shadow'>
          <Row>
            <Col span={3}>
              <div style={{float:'left'}}>
                <img src='./assets/images/exchangePoloniex.png' style={{marginTop:'4px'}} />
              </div>
              <div style={{float:'left'}}>
                <span style={{paddingLeft:'2px', verticalAlign:'5px'}}><span className='font-weight-500'>{parseFloat(this.rates.poloniex.last).toFixed(8)}</span> BTC</span>
              </div>
              <div style={{clear:'both'}}></div>
            </Col>
            <Col span={3}>
              <div style={{float:'left'}}>
                <img src='./assets/images/exchangeBittrex.png' style={{marginTop:'4px'}} />
              </div>
              <div style={{float:'left'}}>
                <span style={{paddingLeft:'2px', verticalAlign:'5px'}}><span className='font-weight-500'>{parseFloat(this.rates.bittrex.Last).toFixed(8)}</span> BTC</span>
              </div>
              <div style={{clear:'both'}}></div>
            </Col>
            <Col span={3}>
              <div style={{float:'left'}}>
                <img src='./assets/images/exchangeRawx.png' style={{marginTop:'4px'}} />
              </div>
              <div style={{float:'left'}}>
                <span style={{paddingLeft:'2px', verticalAlign:'5px'}}><span className='font-weight-500'>{parseFloat(this.rates.rawx.lastprice).toFixed(8)}</span> BTC</span>
              </div>
              <div style={{clear:'both'}}></div>
            </Col>
            <Col span={15}>
              <div className='text-right' style={{paddingRight:'10px'}}>
                <p>
                  Vcash <span className='font-weight-500'>{this.wallet.info.version.split(':')[1]}</span> &nbsp;
                  Wallet <span className='font-weight-500'>{this.wallet.info.walletversion}</span> &nbsp;
                  UI <span className='font-weight-500'>{process.env.npm_package_version}</span>
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default Root
