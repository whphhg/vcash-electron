import React from 'react'
import { hashHistory } from 'react-router'
import { inject, observer } from 'mobx-react'
import { Col, Menu, Row, Tooltip } from 'antd'
import DevTools from 'mobx-react-devtools'

/** Required components. */
import RpcManager from './RpcManager'
// import Transaction from './Transaction'
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'
import WalletEncrypt from './WalletEncrypt'

/** Make the component reactive and inject MobX stores. */
@observer(['rates', 'transactions', 'wallet'])

/**
 * TODO: Staking indicator if config pos:1 & unlocked (gavel, loyalty, flag, flash on, rowing).
 */
class Root extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.transactions = props.transactions
    this.wallet = props.wallet
    this.setRoute = this.setRoute.bind(this)

    /** Set active menu item. */
    this.activeRoute = '/'
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
        <RpcManager />
        <header className='shadow'>
          <img src='./assets/images/logoGrey.png' />
          <p>Balance <br /> <span>{(this.wallet.info.balance).toFixed(6)}</span> XVC</p>
          <p className='balance'>~<span>{(this.wallet.info.balance * this.rates.average).toFixed(8)}</span> BTC</p>
          <p className='balance'>~<span>{(this.wallet.info.balance * this.rates.average * this.rates.local).toFixed(2)}</span> {this.rates.localCurrency}</p>
          <div className='incoming'>
            {this.transactions.amountUnconfirmed > 0 && (<p>Pending <br /> <span>{this.transactions.amountUnconfirmed.toFixed(6)}</span> XVC</p>)}
            {this.wallet.info.newmint > 0 && (<p>Immature <br /> <span>{this.wallet.info.newmint.toFixed(6)}</span> XVC</p>)}
            {this.wallet.info.stake > 0 && (<p>Staking <br /> <span>{this.wallet.info.stake.toFixed(6)}</span> XVC</p>)}
          </div>
          <div className='controls'>
            <WalletLock />
            <WalletUnlock />
            <WalletEncrypt />
          </div>
          <nav>
            <Menu onClick={this.setRoute} selectedKeys={[this.activeRoute]} mode='horizontal'>
              <Menu.Item key='/'><i className='material-icons md-20'>receipt</i></Menu.Item>
              <Menu.Item key='send'><i className='material-icons md-20'>send</i></Menu.Item>
              <Menu.Item key='addresses'><i className='material-icons md-20'>account_balance_wallet</i></Menu.Item>
              <Menu.Item key='network'><i className='material-icons md-20'>settings_input_antenna</i></Menu.Item>
              <Menu.Item key='maintenance'><i className='material-icons md-20'>settings</i></Menu.Item>
            </Menu>
          </nav>
          <div className='indicators'>
            {
              this.wallet.incentive.votecandidate === true && (
                <Tooltip placement='bottom' title={<p>Valid collateral of <span className='font-weight-500'>{(this.wallet.incentive.collateralbalance).toFixed(6)}</span> XVC.</p>}>
                  <i className='material-icons md-20' style={{color:'#43464B'}}>verified_user</i>
                </Tooltip>
              )
            }
          </div>
        </header>
        <main>{this.props.children}</main>
        <footer className='shadow'>
          <img src='./assets/images/exchangePoloniex.png' />
          <p><span>{parseFloat(this.rates.poloniex.last).toFixed(8)}</span> BTC</p>
          <img src='./assets/images/exchangeBittrex.png' />
          <p><span>{parseFloat(this.rates.bittrex.Last).toFixed(8)}</span> BTC</p>
          <img src='./assets/images/exchangeRawx.png' />
          <p><span>{parseFloat(this.rates.rawx.lastprice).toFixed(8)}</span> BTC</p>
          <p className='right'>UI <span>{process.env.npm_package_version}</span></p>
          <p className='right'>Wallet <span>{this.wallet.info.walletversion}</span></p>
          <p className='right'>Vcash <span>{this.wallet.info.version.split(':')[1]}</span></p>
        </footer>
      </div>
    )
  }
}

export default Root
