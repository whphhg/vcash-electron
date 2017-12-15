import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { dataPath } from '../../utilities/common'

/** Ant Design */
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'

@translate(['wallet'])
@inject('rpc', 'wallet')
@observer
class WalletDump extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
    this.dumpWallet = this.dumpWallet.bind(this)
  }

  /**
   * Dump the wallet.
   * @function dumpWallet
   */
  async dumpWallet() {
    const res = await this.rpc.dumpWallet()

    if ('result' in res === true) {
      message.success(this.t('dumped'))
    }
  }

  render() {
    return (
      <div>
        <div className="flex">
          <i className="material-icons md-16">assignment</i>
          <p>{this.t('dumpDesc')}</p>
        </div>
        <div className="flex-sb" style={{ margin: '15px 0 10px 0' }}>
          <p style={{ width: '140px' }}>{this.t('saveInto')}</p>
          <Input
            disabled
            style={{ flex: 1 }}
            value={
              this.rpc.connection.status.tunnel === true
                ? this.t('remoteDataFolder')
                : dataPath()
            }
          />
        </div>
        <div className="flex" style={{ justifyContent: 'flex-end' }}>
          <Button
            disabled={this.wallet.isLocked === true}
            onClick={this.dumpWallet}
          >
            {this.t('dump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletDump
