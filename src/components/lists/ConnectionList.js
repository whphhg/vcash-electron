import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Component */
import ConnectionListItem from './ConnectionListItem.js'

@translate(['common'])
@inject('connections', 'gui')
@observer
class ConnectionList extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui
  }

  render() {
    return (
      <div className="list" style={{ maxHeight: this.gui.window.height - 70 }}>
        <List
          length={this.connections.ids.length}
          itemRenderer={(index, key) => (
            <ConnectionListItem
              index={index}
              key={key}
              t={this.t}
              connections={this.connections}
              language={this.gui.language}
            />
          )}
        />
      </div>
    )
  }
}

export default ConnectionList
