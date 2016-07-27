import React from 'react'
import { inject, observer } from 'mobx-react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import SendIcon from 'material-ui/svg-icons/content/send'

/**
 * TODO: Show icons if vote candidate & staking (config.dat pos:1 & unlocked).
 *       Staking (gavel, flag, flash on, rowing, loyalty).
 *       Vote candidate (thumbs up, verified user, present to all, all inclusinve,stars).
 */
@inject('send')
@inject('wallet')
@observer

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.send = props.send
    this.wallet = props.wallet
    this.toggleMenu = this.toggleMenu.bind(this)
    this.toggleSend = this.toggleSend.bind(this)
  }

  toggleMenu() {
    this.wallet.toggleMenu()
  }

  toggleSend() {
    this.send.toggleDrawer()
  }

  render() {
    return (
      <AppBar
        title={this.wallet.balance + ' XVC'}
        iconElementLeft={
          <IconButton onTouchTap={this.toggleMenu}>
            <MenuIcon color='#FFFFFF' />
          </IconButton>
        }
        iconElementRight={
          <IconButton onTouchTap={this.toggleSend}>
            <SendIcon color='#FFFFFF' />
          </IconButton>
        }
      />
    )
  }
}

export default Header
