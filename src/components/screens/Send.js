import React from 'react'

/** Components */
import AccountFilter from '../search/AccountFilter.js'
import Address from '../wallet/Address.js'
import AddressFilter from '../search/AddressFilter.js'
import AddressFind from '../search/AddressFind.js'
import AddressGet from '../wallet/AddressGet.js'
import AddressList from '../lists/AddressList.js'
import CurrencyConverter from '../utilities/CurrencyConverter.js'
import Footer from '../Footer.js'
import Header from '../Header.js'
import Message from '../wallet/Message.js'
import RecipientList from '../lists/RecipientList.js'
import SendControls from '../send/SendControls.js'
import SendOptions from '../send/SendOptions.js'
import SpendInfo from '../send/SpendInfo.js'
import SpendOutputList from '../lists/SpendOutputList.js'

const Send = props => (
  <div id="AppListContent">
    <div className="list grid-tb">
      <AddressList />
      <div>
        <div style={{ margin: '0 10px 0 10px' }}>
          <AddressFind />
        </div>
        <hr />
        <div style={{ margin: '0 10px 10px 10px' }}>
          <div className="flex-sb">
            <div className="flex">
              <div className="flex" style={{ margin: '0 5px 0 0' }}>
                <AddressGet />
              </div>
              <Message />
            </div>
            <div className="flex">
              <div className="flex" style={{ margin: '0 5px 0 0' }}>
                <AccountFilter />
              </div>
              <AddressFilter />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="AppHeaderFooter">
      <Header />
      <div id="OutputsRecipients">
        <div>
          <Address />
          <SpendOutputList />
          <SpendInfo />
        </div>
        <div className="grid-tb">
          <div>
            <div className="flex" style={{ margin: '0 0 10px 0' }}>
              <SendControls />
            </div>
            <RecipientList />
          </div>
          <div>
            <SendOptions />
            <hr />
            <CurrencyConverter />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>
)

export default Send
