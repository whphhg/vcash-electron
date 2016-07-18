import React from 'react'
import Snackbar from 'material-ui/Snackbar'

const WalletLock = ({ isOpen, toggleLock, toggleUnlock }) => {
  process.env.NODE_ENV === 'development' && console.log('%c' + '<WalletLock />', 'color:#673AB7')
  return (
    <div>
      <Snackbar
        open={isOpen}
        message="Wallet has been locked."
        action="Unlock?"
        autoHideDuration={3000}
        onActionTouchTap={toggleUnlock}
        onRequestClose={toggleLock}
      />
    </div>
  )
}

export default WalletLock
