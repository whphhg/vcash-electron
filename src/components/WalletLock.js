import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Tooltip, message } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletLock extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
  }

  /**
   * Lock the wallet.
   * @function lock
   */
  lock = () => {
    this.rpc.execute([{ method: 'walletlock', params: [] }], response => {
      /** Update lock status and display a success message. */
      if (response[0].hasOwnProperty('result') === true) {
        this.wallet.getLockStatus()
        message.success(this.t('wallet:locked'), 6)
      }
    })
  }

  render () {
    if (this.wallet.isEncrypted === false || this.wallet.isLocked === true) {
      return null
    }

    return (
      <Tooltip placement='bottomRight' title={this.t('wallet:unlocked')}>
        <Button onClick={this.lock} size='small' type='primary'>
          <i className='material-icons md-20'>lock_open</i>
        </Button>
      </Tooltip>
    )
  }
}

export default WalletLock
