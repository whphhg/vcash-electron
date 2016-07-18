import React from 'react'
import Dialog from 'material-ui/Dialog'

const RpcStatus = ({ isRunning }) => {
  let isOpen = true

  // Don't open the dialog when the wallet is starting up or if already running.
  if (isRunning === null || isRunning) {
    isOpen = false
  }

  process.env.NODE_ENV === 'development' && console.log('%c' + '<RpcStatus />', 'color:#673AB7')
  return (
    <div>
      <Dialog title="Daemon not running!" modal={true} open={isOpen}>
        To continue using the wallet please re-start the daemon.
      </Dialog>
    </div>
  )
}

export default RpcStatus
