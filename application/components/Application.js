import React from 'react'
import DevTools from 'mobx-react-devtools'

import DaemonStatus from './DaemonStatus'
import Footer from './Footer'
import Header from './Header'
import Menu from './Menu'
import Send from './Send'
import Transaction from './Transaction'
import WalletEncrypt from './WalletEncrypt'
import WalletLock from './WalletLock'
import WalletUnlock from './WalletUnlock'

const Application = ({ children }) => (
  <div>
    { process.env.NODE_ENV === 'dev' && <DevTools /> }

    <WalletEncrypt />
    <WalletLock />
    <WalletUnlock />
    <DaemonStatus />

    <Menu />
    <Send />
    <Transaction />

    <Header />
    { children }
    <Footer />
  </div>
)

export default Application
