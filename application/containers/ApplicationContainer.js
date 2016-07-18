import React from 'react'

import DevToolsContainer from '../containers/DevToolsContainer'
import FooterContainer from '../containers/FooterContainer'
import HeaderContainer from '../containers/HeaderContainer'
import MenuContainer from '../containers/MenuContainer'
import RpcStatusContainer from '../containers/RpcStatusContainer'
import SendContainer from '../containers/SendContainer'
import TransactionContainer from '../containers/TransactionContainer'
import WalletEncryptContainer from '../containers/WalletEncryptContainer'
import WalletLockContainer from '../containers/WalletLockContainer'
import WalletUnlockContainer from '../containers/WalletUnlockContainer'

const ApplicationContainer = ({ children }) => (
  <div>
    {process.env.NODE_ENV === 'development' && <DevToolsContainer />}

    <FooterContainer />
    <HeaderContainer />
    <MenuContainer />
    <RpcStatusContainer />
    <SendContainer />
    <TransactionContainer />
    <WalletEncryptContainer />
    <WalletLockContainer />
    <WalletUnlockContainer />

    <main>
      {children}
    </main>
  </div>
)

export default ApplicationContainer
