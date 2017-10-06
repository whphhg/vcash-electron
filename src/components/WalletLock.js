import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Tooltip } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class WalletLock extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Bind the async function. */
    this.walletLock = this.walletLock.bind(this)
  }

  /**
   * Lock the wallet.
   * @function walletLock
   */
  async walletLock () {
    const res = await this.rpc.walletLock()

    if ('result' in res === true) {
      /** Update wallet's lock status. */
      this.wallet.getLockStatus()
    }
  }

  render () {
    const { isEncrypted, isLocked } = this.wallet

    /** Do not render if the wallet is not encrypted or is locked. */
    if (isEncrypted === false || isLocked === true) return null
    return (
      <Tooltip placement='bottomRight' title={this.t('wallet:unlocked')}>
        <Button onClick={this.walletLock}>
          <i className='material-icons md-16'>lock_open</i>
        </Button>
      </Tooltip>
    )
  }
}

export default WalletLock
