import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'
import { dataPath } from '../utilities/common'

/** Wallet dumping component. */
@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletDump extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
  }

  /**
   * Dump the wallet.
   * @function dumpWallet
   */
  dumpWallet = () => {
    this.rpc.execute([{ method: 'dumpwallet', params: [] }], response => {
      if (response[0].hasOwnProperty('result') === true) {
        /** Display a success message for 6 seconds. */
        message.success(this.t('wallet:dumped'), 6)
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>assignment</i>
          <p>
            {this.t('wallet:dumpLong')}
          </p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 5px 0' }}>
          <p style={{ width: '120px' }}>
            {this.t('wallet:saveInto')}
          </p>
          <Input
            disabled
            style={{ flex: 1 }}
            value={
              this.rpc.connection.status.tunnel === true
                ? this.t('wallet:remoteDataFolder')
                : dataPath()
            }
          />
        </div>
        <div className='flex' style={{ justifyContent: 'flex-end' }}>
          <Button disabled={this.wallet.isLocked === true} onClick={this.dump}>
            {this.t('wallet:dump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletDump
