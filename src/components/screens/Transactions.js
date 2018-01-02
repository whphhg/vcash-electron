import React from 'react'

/** Components */
import ChainBlender from '../wallet/ChainBlender.js'
import DailyTotalsChart from '../charts/DailyTotalsChart.js'
import Footer from '../Footer.js'
import Header from '../Header.js'
import Transaction from '../wallet/Transaction.js'
import TransactionFilter from '../search/TransactionFilter.js'
import TransactionFind from '../search/TransactionFind.js'
import TransactionList from '../lists/TransactionList.js'

const Transactions = props => (
  <div id="AppListContent">
    <div className="list grid-tb">
      <TransactionList />
      <div>
        <div style={{ margin: '0 10px 0 10px' }}>
          <TransactionFind />
        </div>
        <hr />
        <div style={{ margin: '0 10px 10px 10px' }}>
          <div className="flex-sb">
            <ChainBlender />
            <TransactionFilter />
          </div>
        </div>
      </div>
    </div>
    <div id="AppHeaderFooter">
      <Header />
      <div className="grid-tb">
        <Transaction />
        <div style={{ minWidth: '100%' }}>
          <DailyTotalsChart />
        </div>
      </div>
      <Footer />
    </div>
  </div>
)

export default Transactions
