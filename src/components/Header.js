import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Menu, Tooltip } from 'antd'

/** Required components. */
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rates', 'transactions', 'ui', 'wallet') @observer

class Header extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rates = props.rates
    this.transactions = props.transactions
    this.ui = props.ui
    this.wallet = props.wallet
    this.setRoute = this.setRoute.bind(this)
  }

  setRoute (e) {
    this.ui.setRoute(e.key)
  }

  render () {
    const { local, localCurrency, average } = this.rates
    const { balance, newmint, stake } = this.wallet.info
    const { votecandidate, collateralbalance } = this.wallet.incentive
    const { Item } = Menu

    return (
      <header className='shadow'>
        <img src='./assets/images/logoGrey.png' />
        <p>
          {this.t('wallet:balance')}
          <br />
          <span>{(balance).toFixed(6)}</span> XVC
        </p>
        <p className='balance'>
          ~<span>{(balance * average).toFixed(8)}</span> BTC
        </p>
        <p className='balance'>
          ~<span>{(balance * average * local).toFixed(2)} </span>
          {localCurrency}
        </p>
        <div className='incoming'>
          {
            this.transactions.pendingAmount > 0 && (
              <p>
                {this.t('wallet:pending')}
                <br />
                <span>{this.transactions.pendingAmount.toFixed(6)}</span> XVC
              </p>
            )
          }
          {
            newmint > 0 && (
              <p>
                {this.t('wallet:immature')}
                <br />
                <span>{newmint.toFixed(6)}</span> XVC
              </p>
            )
          }
          {
            stake > 0 && (
              <p>
                {this.t('wallet:staking')}
                <br />
                <span>{stake.toFixed(6)}</span> XVC
              </p>
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
            <Item key='/'>
              <i className='material-icons md-20'>account_balance_wallet</i>
            </Item>
            <Item key='addresses'>
              <i className='material-icons md-20'>send</i>
            </Item>
            <Item key='maintenance'>
              <i className='material-icons md-20'>settings</i>
            </Item>
          </Menu>
        </nav>
        <div className='indicators'>
          {
            votecandidate === true && (
              <Tooltip
                placement='bottom'
                title={
                  <p>
                    {this.t('wallet:validCollateral')}
                    <span className='text-dotted'>
                      {' ' + (collateralbalance).toFixed(6) + ' '}
                    </span>
                    XVC.
                  </p>
                }
              >
                <i
                  className='material-icons md-20'
                  style={{color: '#43464B'}}
                >
                  verified_user
                </i>
              </Tooltip>
            )
          }
          {
            /**
             * TODO: Staking indicator if config pos:1 & unlocked
             * (gavel, loyalty, flag, flash on, rowing).
             */
          }
        </div>
      </header>
    )
  }
}

export default Header
