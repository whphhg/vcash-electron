import React from 'react'
import DevTools from 'mobx-react-devtools'
import { message, notification } from 'antd'

/** Required components. */
import Footer from './Footer'
import Header from './Header'
import RpcManager from './RpcManager'
import Transaction from './Transaction'

/** Set notification and message top margin. */
notification.config({top: 65})
message.config({top: 11})

const Root = (props) => (
  <div>
    {process.env.NODE_ENV === 'dev' && <DevTools />}
    <Header />
    <main>{props.children}</main>
    <Transaction />
    <RpcManager />
    <Footer />
  </div>
)

export default Root
