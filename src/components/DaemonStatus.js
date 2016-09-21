import React from 'react'
import { inject, observer } from 'mobx-react'
import { Modal } from 'antd'

/** Make the component reactive and inject MobX stores. */
@observer(['daemon'])

class DaemonStatus extends React.Component {
  constructor(props) {
    super(props)
    this.daemon = props.daemon
  }

  render() {
    return (
      <Modal title='Daemon not running!'
        footer=''
        closable={false}
        visible={this.daemon.isRunning === null || this.daemon.isRunning ? false : true}
      >
        To continue using the UI please re-start the Vcash daemon.
      </Modal>
    )
  }
}

export default DaemonStatus
