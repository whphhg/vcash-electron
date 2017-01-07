import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Tooltip } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('wallet') @observer

class WalletLock extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.wallet = props.wallet
    this.walletlock = this.walletlock.bind(this)
  }

  walletlock () {
    this.wallet.walletlock()
  }

  render () {
    if (this.wallet.isLocked === true) return null
    return (
      <Tooltip
        title={this.t('wallet:unlocked')}
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
}

export default WalletLock
