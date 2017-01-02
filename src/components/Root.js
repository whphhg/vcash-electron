import React from 'react'
import DevTools from 'mobx-react-devtools'
import { notification } from 'antd'

/** Required components. */
import Footer from './Footer'
import Header from './Header'
import RpcManager from './RpcManager'
import Transaction from './Transaction'

/** Set notification's top margin. */
notification.config({ top: 65 })

const Root = (props) => (
  <div>
    {process.env.NODE_ENV === 'dev' && <DevTools />}
    <RpcManager />
    <Transaction />
    <Header />
    <main>{props.children}</main>
    <Footer />
  </div>
)

export default Root
