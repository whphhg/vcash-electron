import React from 'react'
import List from 'react-list'
import { translate } from 'react-i18next'
import { inject, observer } from 'mobx-react'

/** Components */
import ConnectionEdit from './ConnectionEdit'
import ConnectionListItem from './ConnectionListItem'
import SetLocaleSettings from './SetLocaleSettings'

@translate(['wallet'])
@inject('connections', 'gui')
@observer
class Connections extends React.Component {
  constructor(props) {
    super(props)
    this.t = props.t
    this.connections = props.connections
    this.gui = props.gui

    /** Reference to the List component, exposing methods. */
    this.list = null
  }

  /**
   * Add new connection and scroll to it in the List.
   * @function add
   */
  add = () => {
    this.connections.add()
    this.list.scrollTo(this.connections.ids.indexOf(this.connections.viewingId))
  }

  render() {
    return (
      <div id="AppListContent">
        <div className="list grid-tb">
          <div
            className="list"
            style={{ maxHeight: this.gui.window.height - 70, width: '100%' }}
          >
            <List
              itemRenderer={(index, key) => (
                <ConnectionListItem
                  connections={this.connections}
                  index={index}
                  key={key}
                  language={this.gui.language}
                  t={this.t}
                />
              )}
              length={this.connections.ids.length}
              ref={c => (this.list = c)}
              type="uniform"
              useStaticSize
              useTranslate3d
            />
          </div>
          <div style={{ margin: '10px' }}>
            <SetLocaleSettings />
          </div>
        </div>
        <ConnectionEdit add={this.add} connections={this.connections} />
      </div>
    )
  }
}

export default Connections
