import React from 'react'
import DevTools from 'mobx-react-devtools'

/** Required components. */
import Footer from './Footer'
import Header from './Header'
import RpcManager from './RpcManager'
// import Transaction from './Transaction'

const Root = (props) => (
  <div>
    {process.env.NODE_ENV === 'dev' && <DevTools />}
    <RpcManager />
    <Header />
    <main>{props.children}</main>
    <Footer />
  </div>
)

export default Root
