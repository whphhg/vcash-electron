import React from 'react'
import { message, notification } from 'antd'

/** Required components. */
import Footer from './Footer'
import Header from './Header'
import Transaction from './Transaction'

/** Set notification and message top margin. */
notification.config({top: 65})
message.config({top: 11})

const Root = (props) => (
  <div>
    <Header />
    <main>{props.children}</main>
    <Transaction />
    <Footer />
  </div>
)

export default Root
