import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'
import { dataPath } from '../utilities/common'

@translate(['wallet'], { wait: true })
@inject('rpcNext', 'wallet')
@observer
class WalletDump extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpcNext
    this.wallet = props.wallet

    /** Bind the async function. */
    this.dumpWallet = this.dumpWallet.bind(this)
  }

  /**
   * Dump the wallet.
   * @function dumpWallet
   */
  async dumpWallet () {
    const response = await this.rpc.dumpWallet()

    if ('result' in response === true) {
      /** Display a success message for 6s. */
      message.success(this.t('wallet:dumped'), 6)
    }
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>assignment</i>
          <p>{this.t('wallet:dumpLong')}</p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 5px 0' }}>
          <p style={{ width: '120px' }}>{this.t('wallet:saveInto')}</p>
          <Input
            disabled
            style={{ flex: 1 }}
            value={
              this.rpc.conn.status.tunnel === true
                ? this.t('wallet:remoteDataFolder')
                : dataPath()
            }
          />
        </div>
        <div className='flex' style={{ justifyContent: 'flex-end' }}>
          <Button
            disabled={this.wallet.isLocked === true}
            onClick={this.dumpWallet}
          >
            {this.t('wallet:dump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletDump
