import React from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Tooltip } from 'antd'

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletLock extends React.Component {
  constructor(props) {
    super(props)
    this.wallet = props.wallet
    this.walletlock = this.walletlock.bind(this)
  }

  walletlock() {
    this.wallet.walletlock()
  }

  render() {
    return (
      <div>
        {
          this.wallet.isLocked === false && this.wallet.isEncrypted === true && (
            <Tooltip
              title='Wallet is unlocked'
              placement='bottomRight'
            >
              <Button
                size='small'
                type='primary'
                onClick={this.walletlock}
              >
                <i className='material-icons md-20'>lock_open</i>
              </Button>
            </Tooltip>
          )
        }
      </div>
    )
  }
}

export default WalletLock
