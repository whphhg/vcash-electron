import React from 'react'
import { observer } from 'mobx-react'
import { Modal } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['rpc'])

/** TODO: Remote RPC using tunnel-ssh -> ssh -L9195:localhost:9195 user@ip). */
class RpcManager extends React.Component {
  constructor(props) {
    super(props)
    this.rpc = props.rpc
  }

  render() {
    return (
      <Modal title='RPC connection lost' footer='' closable={false} visible={this.rpc.status === null || this.rpc.status === true ? false : true}>
        To continue using the UI please re-start the Vcash daemon.
      </Modal>
    )
  }
}

export default RpcManager
