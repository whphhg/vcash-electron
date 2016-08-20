import React from 'react'
import DevTools from 'mobx-react-devtools'
import { inject, observer } from 'mobx-react'
import { Link, IndexLink, hashHistory } from 'react-router'
import { Icon, IconToggle } from 'react-mdl'

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

        {
          this.wallet.isLocked && this.wallet.isEncrypted && (<IconToggle name='lock' onChange={this.toggleUnlock} />) ||
          !this.wallet.isLocked && this.wallet.isEncrypted && (<IconToggle name='lock_open' onChange={this.lock} />) ||
          !this.wallet.isEncrypted && !this.wallet.isLocked && (<IconToggle name='vpn_key' onChange={this.toggleEncrypt} />)
        }

        <img src='./assets/images/logoRed.png' alt='' width='35px' height='35px' />
        <p>
          {this.wallet.balance}
          {(this.wallet.balance * this.rates.average).toFixed(8) + ' BTC'}
          {(this.wallet.balance * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}
        </p>

        <p>
          Unconfirmed {this.transactions.amountUnconfirmed.toFixed(6) + ' XVC'}
          Staking {this.wallet.stake.toFixed(6) + ' XVC'}
          Immature {this.wallet.newmint.toFixed(6) + ' XVC'}
        </p>

        <div className='tabsContainer'>
          <div className='tabs'>
            <IndexLink to='/' activeClassName='activetab'><Icon name='account_balance' />History</IndexLink>
            <Link to='send' activeClassName='activetab'><Icon name='send' />Send</Link>
            <Link to='receive' activeClassName='activetab'><Icon name='library_books' />Receive</Link>
            <Link to='network' activeClassName='activetab'><Icon name='router' />Network</Link>
            <Link to='maintenance' activeClassName='activetab'><Icon name='settings' />Maintenance</Link>
          </div>
        </div>

        <section>{this.props.children}</section>
      </div>
    )
  }
}
export default Application
