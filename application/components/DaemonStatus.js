import React from 'react'
import { inject, observer } from 'mobx-react'
import Dialog from 'material-ui/Dialog'

@inject('daemon')
@observer

class DaemonStatus extends React.Component {
  constructor(props) {
    super(props)
    this.daemon = props.daemon
  }

  render() {
    return (
      <Dialog
        title='Daemon not running!'
        modal={true}
        open={this.daemon.isRunning === null || this.daemon.isRunning ? false : true}
      >
        To continue using the UI please re-start the Vcash daemon.
      </Dialog>
    )
  }
}

export default DaemonStatus
