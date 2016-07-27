import React from 'react'
import { Link, IndexLink } from 'react-router'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import AppBar from 'material-ui/AppBar'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import ContactsIcon from 'material-ui/svg-icons/social/people'
import AddressBookIcon from 'material-ui/svg-icons/av/library-books'
import EncryptIcon from 'material-ui/svg-icons/communication/vpn-key'
import LockIcon from 'material-ui/svg-icons/action/lock-open'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import NetworkIcon from 'material-ui/svg-icons/hardware/router'
import MaintenanceIcon from 'material-ui/svg-icons/action/settings'
import TransactionsIcon from 'material-ui/svg-icons/action/account-balance'
import UnlockIcon from 'material-ui/svg-icons/action/lock'
import ChainBlender from './ChainBlender'

@inject('rates')
@inject('transactions')
@inject('wallet')
@inject('walletEncrypt')
@inject('walletLock')
@inject('walletUnlock')
@observer

class Menu extends React.Component {
  constructor(props) {
    super(props)

    this.rates = props.rates
    this.transactions = props.transactions
    this.wallet = props.wallet
    this.walletEncrypt = props.walletEncrypt
    this.walletLock = props.walletLock
    this.walletUnlock = props.walletUnlock

    this.lock = this.lock.bind(this)
    this.toggleEncrypt = this.toggleEncrypt.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.toggleUnlock = this.toggleUnlock.bind(this)
  }

  lock() {
    this.walletLock.lock()
  }

  toggleEncrypt() {
    this.walletEncrypt.toggleDialog()
  }

  toggleMenu() {
    this.wallet.toggleMenu()
  }

  toggleUnlock() {
    this.walletUnlock.toggleDialog()
  }

  render() {
    return (
      <Drawer docked={false} width={350} open={this.wallet.drawer} onRequestChange={this.toggleMenu}>
        <AppBar title={this.wallet.balance + ' XVC'}
          iconElementLeft={<IconButton onTouchTap={this.toggleMenu}><MenuIcon color='#FFFFFF' /></IconButton>}
          iconElementRight={
            this.wallet.isLocked && this.wallet.isEncrypted &&
            (
              <IconButton onTouchTap={this.toggleUnlock}><UnlockIcon color='#FFFFFF' /></IconButton>
            ) ||
            !this.wallet.isLocked && this.wallet.isEncrypted &&
            (
              <IconButton onTouchTap={this.lock}><LockIcon color='#FFFFFF' /></IconButton>
            ) ||
            !this.wallet.isEncrypted && !this.wallet.isLocked &&
            (
              <IconButton onTouchTap={this.toggleEncrypt}><EncryptIcon color='#FFFFFF' /></IconButton>
            )
          }
        />

        <div className='container-fluid menu'>
          <div className='row'>
            <div className='col-md-2'>
              <img src='./assets/images/logoRed.png' alt='' width='48px' height='48px' style={{marginTop:'15px', marginBottom:'10px'}} />
            </div>
            <div className='col-md-10 text-right'>
              <h4 style={{textAlign:'right', marginTop:'15px'}}>{(this.wallet.balance * this.rates.average).toFixed(8) + ' BTC'}</h4>
              <h4 style={{textAlign:'right'}}>{(this.wallet.balance * this.rates.average * this.rates.local).toFixed(2) + ' ' + this.rates.localCurrency}</h4>
            </div>
          </div>

          <div className='row'>
            <div className='col-md-5'>
              <p>Unconfirmed</p>
              <p>Staking</p>
              <p>Immature</p>
            </div>
            <div className='col-md-7 text-right'>
              <h5>{this.transactions.amountUnconfirmed.toFixed(6) + ' XVC'}</h5>
              <h5>{this.wallet.stake.toFixed(6) + ' XVC'}</h5>
              <h5>{this.wallet.newmint.toFixed(6) + ' XVC'}</h5>
            </div>
          </div>

          <ChainBlender />
        </div>

        <MenuItem
          value={1}
          onTouchTap={this.toggleMenu}
          containerElement={<IndexLink to='/' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Transactions'
          leftIcon={<TransactionsIcon />}
        />
        <MenuItem
          value={2}
          onTouchTap={this.toggleMenu}
          containerElement={<Link to='addressBook' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Address book'
          leftIcon={<AddressBookIcon />}
        />
        <MenuItem
          value={3}
          onTouchTap={this.toggleMenu}
          containerElement={<Link to='contacts' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Contacts'
          leftIcon={<ContactsIcon />}
          disabled={true}
        />
        <MenuItem
          value={4}
          onTouchTap={this.toggleMenu}
          containerElement={<Link to='network' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Network'
          leftIcon={<NetworkIcon />}
        />
        <MenuItem
          value={5}
          onTouchTap={this.toggleMenu}
          containerElement={<Link to='maintenance' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Maintenance'
          leftIcon={<MaintenanceIcon />}
        />
      </Drawer>
    )
  }
}

export default Menu
