import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Button, Input, message } from 'antd'
import { dataPath } from '../utilities/common'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rpc', 'wallet') @observer

export default class WalletDump extends React.Component {
  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
  }

  /**
   * Dump the wallet.
   * @function dump
   */
  dump = () => {
    this.rpc.execute([
      { method: 'dumpwallet', params: [] }
    ], (response) => {
      /** Display a success message. */
      if (response[0].hasOwnProperty('result') === true) {
        message.success(this.t('wallet:dumped'), 6)
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>assignment</i>
          <p>{this.t('wallet:dumpLong')}</p>
        </div>
        <div className='flex-sb' style={{margin: '10px 0 5px 0'}}>
          <p style={{width: '120px'}}>{this.t('wallet:saveInto')}</p>
          <Input
            disabled
            style={{flex: 1}}
            value={
              this.rpc.connection.status.tunnel === true
                ? this.t('wallet:remoteDataFolder')
                : dataPath()
            }
          />
        </div>
        <div className='flex' style={{justifyContent: 'flex-end'}}>
          <Button disabled={this.wallet.isLocked === true} onClick={this.dump}>
            {this.t('wallet:dump')}
          </Button>
        </div>
      </div>
    )
  }
}
