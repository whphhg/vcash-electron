import React from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'

import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import SendIcon from 'material-ui/svg-icons/content/send'

/**
 * TODO: Show icons if vote candidate & staking (config.dat pos:1 & unlocked).
 *       Staking (gavel, flag, flash on, rowing, loyalty)
 *       Vote candidate (thumbs up, verified user, present to all, all inclusinve,stars)
 */
const Header = ({ balance, currencyConverter, toggleMenu, toggleSend }) => {
  const onSendClick = () => {
    toggleSend()
    currencyConverter(1, 'vcash')
  }

  process.env.NODE_ENV === 'development' && console.log('%c' + '<Header />', 'color:#673AB7')
  return (
    <div>
      <AppBar
        title={balance + ' XVC'}
        iconElementLeft={
          <IconButton onTouchTap={toggleMenu}>
            <MenuIcon color='#FFFFFF' />
          </IconButton>
        }
        iconElementRight={
          <IconButton onTouchTap={onSendClick}>
            <SendIcon color='#FFFFFF' />
          </IconButton>
        }
      />
    </div>
  )
}

export default Header
