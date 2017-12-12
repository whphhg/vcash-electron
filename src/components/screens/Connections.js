import React from 'react'

/** Components */
import ConnectionList from '../lists/ConnectionList'
import SetConnection from '../settings/SetConnection'
import SetLocaleSettings from '../settings/SetLocaleSettings'

const Connections = props => (
  <div id="AppListContent">
    <div className="list grid-tb">
      <ConnectionList />
      <div style={{ margin: '10px' }}>
        <SetLocaleSettings />
      </div>
    </div>
    <SetConnection />
  </div>
)

export default Connections
