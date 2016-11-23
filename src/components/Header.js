import React from 'react'
import { inject, observer } from 'mobx-react'
import { Menu, Tooltip } from 'antd'

/** Required components. */
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions', 'ui', 'wallet') @observer

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.rates = props.rates
    this.transactions = props.transactions
    this.ui = props.ui
    this.wallet = props.wallet
    this.setRoute = this.setRoute.bind(this)
  }

  setRoute(e) {
    this.ui.setRoute(e.key)
  }

  render() {
    return (
      <header className='shadow'>
        <img src='./assets/images/logoGrey.png' />
        <p>Balance <br /> <span>{(this.wallet.info.balance).toFixed(6)}</span> XVC</p>
        <p className='balance'>~<span>{(this.wallet.info.balance * this.rates.average).toFixed(8)}</span> BTC</p>
        <p className='balance'>~<span>{(this.wallet.info.balance * this.rates.average * this.rates.local).toFixed(2)}</span> {this.rates.localCurrency}</p>
        <div className='incoming'>
          {
            this.transactions.amountUnconfirmed > 0 && (
              <p>Pending <br /> <span>{this.transactions.amountUnconfirmed.toFixed(6)}</span> XVC</p>
            )
          }
          {
            this.wallet.info.newmint > 0 && (
              <p>Immature <br /> <span>{this.wallet.info.newmint.toFixed(6)}</span> XVC</p>
            )
          }
          {
            this.wallet.info.stake > 0 && (
              <p>Staking <br /> <span>{this.wallet.info.stake.toFixed(6)}</span> XVC</p>
            )
          }
        </div>
        <div className='controls'>
          <WalletLock />
          <WalletUnlock />
        </div>
        <nav>
          <Menu
            onClick={this.setRoute}
            selectedKeys={[this.ui.activeRoute]}
            mode='horizontal'
          >
            <Menu.Item key='/'>
              <i className='material-icons md-20'>receipt</i>
            </Menu.Item>
            <Menu.Item key='send'>
              <i className='material-icons md-20'>send</i>
            </Menu.Item>
            <Menu.Item key='addresses'>
              <i className='material-icons md-20'>account_balance_wallet</i>
            </Menu.Item>
            <Menu.Item key='maintenance'>
              <i className='material-icons md-20'>settings</i>
            </Menu.Item>
          </Menu>
        </nav>
        <div className='indicators'>
          {
            this.wallet.incentive.votecandidate === true && (
              <Tooltip
                placement='bottom'
                title={
                  <p>
                    <span>Valid collateral of </span>
                    <span className='text-dotted'>{(this.wallet.incentive.collateralbalance).toFixed(6)}</span>
                    <span> XVC.</span>
                  </p>
                }
              >
                <i className='material-icons md-20' style={{color:'#43464B'}}>verified_user</i>
              </Tooltip>
            )
          }
          {/** TODO: Staking indicator if config pos:1 & unlocked (gavel, loyalty, flag, flash on, rowing). */}
        </div>
      </header>
    )
  }
}

export default Header
