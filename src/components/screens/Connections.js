import React from 'react'

/** Components */
import ConnectionList from '../lists/ConnectionList.js'
import SetConnection from '../settings/SetConnection.js'
import SetLocaleSettings from '../settings/SetLocaleSettings.js'

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
