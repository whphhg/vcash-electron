import React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 } from 'node-uuid'
import { Table, Column, Cell } from 'fixed-data-table'
import { Button, Col, Input, Radio, Row } from 'antd'

/** Required components. */
import TableCell from './TableCell'
import ChainBlender from './ChainBlender'
import TransactionsChart from './TransactionsChart'

/** Make the component reactive and inject MobX stores. */
@observer(['rates', 'transaction', 'transactions', 'wallet'])

/**
 * TODO: Colorize amounts according to category.
 */
class Transactions extends React.Component {
  constructor(props) {
    super(props)
    this.transaction = props.transaction
    this.transactions = props.transactions
    this.rates = props.rates
    this.wallet = props.wallet
    this.filtersUpdateTimer = null

    this.setFilters = this.setFilters.bind(this)
    this.setShowCategory = this.setShowCategory.bind(this)
    this.toggleTransaction = this.toggleTransaction.bind(this)
  }

  setFilters(event) {
    clearTimeout(this.filtersUpdateTimer)
    const filter = event.target.value

    this.filtersUpdateTimer = setTimeout(() => {
      this.transactions.setFilters(filter)
    }, 0.5 * 1000)
  }

  setShowCategory(e) {
    this.transactions.setShowCategory(e.target.value)
  }

  toggleTransaction(rowNumber, columndId) {
    const txid = this.transactions.filtered[rowNumber].txid
    this.transaction.setTxid(txid)
    this.transaction.toggleDialog()
  }

  render() {
    return (
      <div>
        <Row>
          <Col span={6}>
            <div className='margin-10'>
              <ChainBlender />
            </div>
          </Col>
          <Col span={12}>
            <div style={{textAlign:'center'}} className='margin-10'>
              <Radio.Group defaultValue={this.transactions.showCategory} onChange={this.setShowCategory}>
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="receive">Received</Radio.Button>
                <Radio.Button value="send">Sent</Radio.Button>
                <Radio.Button value="generate">Generated</Radio.Button>
              </Radio.Group>
            </div>
          </Col>
          <Col span={6}>
            <div className='margin-10'>
              <Input onChange={this.setFilters} placeholder='Filter transactions' addonAfter={<i className='material-icons md-16'>search</i>} autosize />
            </div>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div className='shadow-2'>
              <div id='transactions'>
                <Table rowsCount={this.transactions.filtered.length} rowHeight={50} headerHeight={50} width={1130} height={447}>
                  <Column
                    header={<Cell>Date</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='time' />}
                    width={200}
                  />
                  <Column
                    header={<Cell>Account</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='account' />}
                    width={200}
                  />
                  <Column
                    header={<Cell>Address</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='address' />}
                    width={340}
                  />
                  <Column
                    header={<Cell>Category</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='category' />}
                    width={90}
                  />
                  <Column
                    header={<Cell>Amount</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='amount' />}
                    width={150}
                  />
                  <Column
                    header={<Cell>{this.rates.localCurrency}</Cell>}
                    cell={<TableCell data={this.transactions.filtered} column='amountLocal' localCurrency={this.rates.localCurrency} />}
                    width={150}
                  />
                </Table>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <TransactionsChart />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Transactions
