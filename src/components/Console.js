import React from 'react'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'
import { shortUid } from '../utilities/common'

/** Ant Design */
import AutoComplete from 'antd/lib/auto-complete'
import Button from 'antd/lib/button'

@translate(['wallet'])
@inject('console', 'gui', 'rpc')
@observer
class Console extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.console = props.console
    this.gui = props.gui
    this.rpc = props.rpc
  }

  render() {
    return (
      <div id="Console">
        <div>
          <div
            style={{
              height: '100%',
              maxHeight: this.gui.window.height - 107,
              maxWidth: this.gui.window.width - 361,
              overflowY: 'scroll'
            }}
          >
            {this.console.responses.map(response => (
              <pre key={shortUid()}>{JSON.stringify(response, null, 2)}</pre>
            ))}
          </div>
        </div>
        <div className="flex">
          <Button
            disabled={this.console.executeStatus !== true}
            onClick={() => this.console.execute()}
            size="small"
          >
            {this.t('execute')}
          </Button>
          <div style={{ flex: 1, margin: '0 5px 0 5px' }}>
            <AutoComplete
              dataSource={this.rpc.methods}
              filterOption
              onChange={this.console.setCommand}
              placeholder={this.t('command')}
              style={{ width: '100%' }}
              value={this.console.command}
            />
          </div>
          <Button onClick={this.console.reset} size="small">
            {this.t('reset')}
          </Button>
        </div>
      </div>
    )
  }
}

export default Console
