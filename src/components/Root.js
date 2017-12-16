import React from 'react'
import { Route } from 'react-router-dom'
import { inject, observer, Provider } from 'mobx-react'

/** Ant Design */
import message from 'antd/lib/message'
import notification from 'antd/lib/notification'

/** Components */
import Maintenance from './screens/Maintenance'
import Network from './screens/Network'
import Send from './screens/Send'
import Transactions from './screens/Transactions'

/** Set notification and message top margin. */
notification.config({ top: 35 })
message.config({ top: 35 })

@inject('connections')
@observer
class Root extends React.Component {
  constructor(props) {
    super(props)
    this.connections = props.connections
  }

  render() {
    return (
      <Provider {...this.connections.viewing.stores}>
        <div>
          <Route path="/:id/transactions" component={Transactions} />
          <Route path="/:id/send" component={Send} />
          <Route path="/:id/network" component={Network} />
          <Route path="/:id/maintenance" component={Maintenance} />
        </div>
      </Provider>
    )
  }
}

export default Root
