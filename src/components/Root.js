import React from 'react'
import { HashRouter, Route } from 'react-router-dom'
import { inject, observer, Provider } from 'mobx-react'
import { message, notification } from 'antd'

/** Required components. */
import Addresses from './Addresses'
import Console from './Console'
import Footer from './Footer'
import Header from './Header'
import Maintenance from './Maintenance'
import Network from './Network'
import Transaction from './Transaction'
import Transactions from './Transactions'

/** Set notification and message top margin. */
notification.config({ top: 65 })
message.config({ top: 11 })

@inject('connections')
@observer
class Root extends React.Component {
  constructor (props) {
    super(props)
    this.connections = props.connections
  }

  render () {
    return (
      <Provider {...this.connections.viewingStores}>
        <HashRouter>
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: '55px 1fr 25px',
                height: '100vh'
              }}
            >
              <Header />
              <div>
                <Route exact path='/:uid' component={Transactions} />
                <Route path='/:uid/addresses' component={Addresses} />
                <Route path='/:uid/maintenance' component={Maintenance} />
                <Route path='/:uid/network' component={Network} />
              </div>
              <Footer />
            </div>
            <Console />
            <Transaction />
          </div>
        </HashRouter>
      </Provider>
    )
  }
}

export default Root
