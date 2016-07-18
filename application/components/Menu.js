import React from 'react'
import { Link, IndexLink } from 'react-router'
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

import ChainBlenderContainer from '../containers/ChainBlenderContainer'

import moment from 'moment'

const Menu = ({ isOpen, exchangeRate, localCurrency, localRate, unconfirmed, wallet, toggleEncrypt, toggleMenu, toggleUnlock, walletLock }) => {
  const IconElementRight = () => {
    if (wallet.status.isLocked) {
      return (
        <IconButton onTouchTap={toggleUnlock}><UnlockIcon color='#FFFFFF' /></IconButton>
      )
    }

    if (!wallet.status.isLocked && wallet.status.isEncrypted) {
      return (
        <IconButton onTouchTap={walletLock}><LockIcon color='#FFFFFF' /></IconButton>
      )
    }

    if (!wallet.status.isEncrypted) {
      return (
        <IconButton onTouchTap={toggleEncrypt}><EncryptIcon color='#FFFFFF' /></IconButton>
      )
    }
  }

  process.env.NODE_ENV === 'development' && console.log('%c' + '<Menu />', 'color:#673AB7')
  return (
    <div>
      <Drawer docked={false} width={350} open={isOpen} onRequestChange={toggleMenu}>
        <AppBar title={wallet.info.balance + ' XVC'}
          iconElementLeft={<IconButton onTouchTap={toggleMenu}><MenuIcon color='#FFFFFF' /></IconButton>}
          iconElementRight={<IconElementRight />}
        />

        <div className='container-fluid menu'>
          <div className='row'>
            <div className='col-md-2'>
              <img src='./assets/images/logoRed.png' alt='' width='48px' height='48px' style={{marginTop:'15px', marginBottom:'10px'}} />
            </div>
            <div className='col-md-10 text-right'>
              <h4 style={{textAlign:'right', marginTop:'15px'}}>{(wallet.info.balance * exchangeRate).toFixed(8) + ' BTC'}</h4>
              <h4 style={{textAlign:'right'}}>{(wallet.info.balance * exchangeRate * localRate).toFixed(2) + ' ' + localCurrency}</h4>
            </div>
          </div>

          <div className='row' style={{marginTop:'20px'}}>
            <div className='col-md-5'>
              <p>Unconfirmed</p>
              <p>Staking</p>
              <p>Immature</p>
            </div>
            <div className='col-md-7 text-right'>
              <h5>{unconfirmed.toFixed(6) + ' XVC'}</h5>
              <h5>{wallet.info.stake.toFixed(6) + ' XVC'}</h5>
              <h5>{wallet.info.newMint.toFixed(6) + ' XVC'}</h5>
            </div>
          </div>

          <ChainBlenderContainer />
        </div>

        <MenuItem
          value={1}
          onTouchTap={toggleMenu}
          containerElement={<IndexLink to='/' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Transactions'
          leftIcon={<TransactionsIcon />}
        />
        <MenuItem
          value={2}
          onTouchTap={toggleMenu}
          containerElement={<Link to='addressBook' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Address book'
          leftIcon={<AddressBookIcon />}
        />
        <MenuItem
          value={3}
          onTouchTap={toggleMenu}
          containerElement={<Link to='contacts' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Contacts'
          leftIcon={<ContactsIcon />}
          disabled={true}
        />
        <MenuItem
          value={4}
          onTouchTap={toggleMenu}
          containerElement={<Link to='network' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Network'
          leftIcon={<NetworkIcon />}
        />
        <MenuItem
          value={5}
          onTouchTap={toggleMenu}
          containerElement={<Link to='maintenance' activeStyle={{color:'#B71C1C'}} />}
          primaryText='Maintenance'
          leftIcon={<MaintenanceIcon />}
        />

        <p className='text-center text-muted' style={{fontSize:'11px', margin:'0px', padding:'0px', marginTop:'20px' }}>
          Vcash <b>{wallet.info.version}</b> &nbsp;&nbsp;&nbsp; Protocol <b>{wallet.info.protocolVersion}</b> &nbsp;&nbsp;&nbsp; Wallet <b>{wallet.info.walletVersion}</b>
        </p>
      </Drawer>
    </div>
  )
}

export default Menu
