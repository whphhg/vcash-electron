import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { Modal } from 'antd'

/** Load translation namespaces and delay rendering until they are loaded. */
@translate(['wallet'], { wait: true })

/** Make the component reactive and inject MobX stores. */
@inject('rpc') @observer

/** TODO: Remote RPC using tunnel-ssh -> ssh -L9195:localhost:9195 user@ip). */
class RpcManager extends React.Component {
  constructor (props) {
    super(props)
    this.rpc = props.rpc
    this.t = props.t
  }

  render () {
    return (
      <Modal
        title={this.t('wallet:rpcLost')}
        footer=''
        closable={false}
        visible={this.rpc.status !== null && !this.rpc.status}
      >
        {this.t('wallet:rpcLostLong')}
      </Modal>
    )
  }
}

export default RpcManager
